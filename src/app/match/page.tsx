"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { Phone, CheckCircle2, XCircle, Clock, Loader2, MapPin } from "lucide-react";
import { getDonationState, setDonationState } from "@/lib/donation-store";
import { Organization, CallStatus } from "@/types";

interface OrgCallState {
  org: Organization;
  status: CallStatus;
  message?: string;
  callId?: string;
}

function buildItemsSummary(items: { name: string; quantity: number; unit: string }[]): string {
  return items.map((i) => `${i.quantity} ${i.unit} of ${i.name}`).join(", ");
}

export default function MatchPage() {
  const router = useRouter();
  const donationState = getDonationState();
  const [callStates, setCallStates] = useState<OrgCallState[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const itemsSummary = buildItemsSummary(donationState.items);

  // Fetch nearby orgs based on donor location
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      // Get donor location
      const loc = donationState.location;
      if (!loc) {
        setError("No location set. Please go back and enter your address.");
        setLoadingOrgs(false);
        return;
      }

      // Fetch nearby orgs
      try {
        const res = await fetch("/api/orgs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: loc.lat, lng: loc.lng }),
        });
        const data = await res.json();

        if (data.error || !data.organizations?.length) {
          setError("No nearby organizations found. Try a different location.");
          setLoadingOrgs(false);
          return;
        }

        const orgs: Organization[] = data.organizations;
        setCallStates(orgs.map((org: Organization) => ({ org, status: "pending" as CallStatus })));
        setLoadingOrgs(false);

        // Start calling orgs sequentially
        await callOrgsSequentially(orgs);
      } catch {
        setError("Failed to find nearby organizations.");
        setLoadingOrgs(false);
      }
    };

    const pollCallStatus = async (callId: string): Promise<{ status: string; message?: string }> => {
      const maxAttempts = 60;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const res = await fetch(`/api/agent/${callId}`);
          const data = await res.json();
          if (data.status !== "calling") {
            return { status: data.status, message: data.message };
          }
        } catch {
          // continue polling
        }
      }
      return { status: "no_answer", message: "Call timed out" };
    };

    const callOrgsSequentially = async (orgs: Organization[]) => {
      for (let i = 0; i < orgs.length; i++) {
        // Skip orgs without phone numbers
        if (!orgs[i].phone || orgs[i].phone.length < 8) {
          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "no_answer", message: "No phone number available" } : s
            )
          );
          continue;
        }

        // Mark as calling
        setCallStates((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "calling" } : s))
        );

        try {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: orgs[i].phone,
              orgName: orgs[i].name,
              itemsSummary,
            }),
          });
          const data = await res.json();

          if (data.error) {
            setCallStates((prev) =>
              prev.map((s, idx) =>
                idx === i ? { ...s, status: "no_answer", message: data.error } : s
              )
            );
            continue;
          }

          const callId = data.callId;
          setCallStates((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, callId } : s))
          );

          const result = await pollCallStatus(callId);

          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: result.status as CallStatus, message: result.message }
                : s
            )
          );

          if (result.status === "accepted") {
            setAccepted(true);
            setDonationState({ matchedOrg: orgs[i] });
            setTimeout(() => router.push("/match/result"), 2000);
            return;
          }
        } catch {
          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "no_answer", message: "Call failed" } : s
            )
          );
        }
      }
    };

    run();
  }, [router, itemsSummary, donationState.location]);

  const statusConfig: Record<CallStatus, { icon: React.ReactNode; label: string; classes: string }> = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Waiting", classes: "text-gray-400 bg-gray-50" },
    calling: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: "Calling...", classes: "text-teal-600 bg-teal-50 border-teal-200" },
    no_answer: { icon: <XCircle className="h-3.5 w-3.5" />, label: "No Answer", classes: "text-amber-600 bg-amber-50" },
    declined: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Declined", classes: "text-red-500 bg-red-50" },
    accepted: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Accepted", classes: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  };

  const typeIcons: Record<string, string> = {
    shelter: "🏠", kitchen: "🍳", fridge: "🧊", foodbank: "🏦",
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <BlurFade delay={0.05}>
        <h1 className="text-3xl font-bold tracking-tight">Matching nearby recipients...</h1>
        <p className="mt-2 text-gray-500">
          Finding shelters and kitchens that can accept your donation. Our AI agent is calling each one.
        </p>
        {donationState.items.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {donationState.items.map((item) => (
              <span key={item.id} className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                {item.name} &times; {item.quantity}
              </span>
            ))}
          </div>
        )}
      </BlurFade>

      {/* Mock Map */}
      <BlurFade delay={0.1}>
        <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative h-52">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-50">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-8 left-12 h-1 w-32 bg-teal-300/60 rounded" />
              <div className="absolute top-14 left-6 h-0.5 w-40 bg-teal-200/50 rounded" />
              <div className="absolute top-24 left-16 h-0.5 w-28 bg-teal-300/40 rounded" />
              <div className="absolute bottom-16 right-8 h-1 w-24 bg-teal-200/50 rounded" />
              <div className="absolute bottom-24 right-16 h-0.5 w-32 bg-teal-300/40 rounded" />
              <div className="absolute top-20 right-12 h-0.5 w-20 bg-teal-200/60 rounded" />
            </div>
            {[
              { top: "20%", left: "30%", active: false },
              { top: "40%", right: "20%", active: true },
              { top: "60%", left: "50%", active: false },
              { top: "30%", right: "35%", active: false },
            ].map((pin, i) => (
              <div key={i} className="absolute" style={pin}>
                <div className={`h-6 w-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${pin.active ? "bg-teal-500" : "bg-teal-400"}`}>
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                {pin.active && <div className="absolute inset-0 rounded-full bg-teal-400 animate-pulse-ring" />}
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* Loading / Error */}
      {loadingOrgs && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          <p className="text-sm text-gray-500">Searching for nearby shelters and food banks...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Org List */}
      {!loadingOrgs && !error && (
        <div className="mt-6 space-y-2.5">
          {callStates.map((cs, i) => {
            const cfg = statusConfig[cs.status];
            return (
              <BlurFade key={cs.org.id} delay={0.15 + i * 0.05}>
                <motion.div
                  layout
                  className={`rounded-xl bg-white border p-4 transition-all duration-500 ${
                    cs.status === "calling"
                      ? "border-teal-200 shadow-md ring-1 ring-teal-100"
                      : cs.status === "accepted"
                      ? "border-emerald-300 shadow-lg bg-emerald-50/30"
                      : "border-gray-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-lg">
                        {typeIcons[cs.org.type] || "🏠"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{cs.org.name}</p>
                        <p className="text-xs text-gray-400 truncate">{cs.org.address}</p>
                        <p className="text-xs text-gray-300">{cs.org.distance} mi away</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shrink-0 ${cfg.classes}`}>
                      {cfg.icon}
                      {cfg.label}
                    </div>
                  </div>
                  <AnimatePresence>
                    {cs.message && cs.status !== "pending" && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 pl-13 text-xs text-gray-400 italic"
                      >
                        {cs.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>
      )}

      {/* Status */}
      <BlurFade delay={0.45}>
        <div className="mt-8">
          {accepted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-semibold text-gray-900">Match found! Redirecting...</p>
            </motion.div>
          ) : !loadingOrgs && !error && callStates.length > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4 text-teal-500" />
              AI agent is calling organizations...
            </div>
          ) : null}
        </div>
      </BlurFade>
    </div>
  );
}
