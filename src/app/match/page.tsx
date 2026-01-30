"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { Phone, CheckCircle2, XCircle, Clock, Building2, Loader2, MapPin } from "lucide-react";
import { setDonationState } from "@/lib/donation-store";
import { Organization, CallStatus } from "@/types";

interface OrgCallState {
  org: Organization;
  status: CallStatus;
  message?: string;
}

const orgs: Organization[] = [
  { id: "org-1", name: "California Homeless Coalition", type: "shelter", address: "Brown Correctional Ave on 5ello", lat: 37.7897, lng: -122.3942, phone: "+1 (415) 555-0101", distance: 0.8, acceptsCategories: ["food", "beverage"], operatingHours: "Mon-Sat 7AM-8PM" },
  { id: "org-2", name: "Central Community Kitchen", type: "kitchen", address: "Usage anaba lobelen 6ls, panree daily", lat: 37.7589, lng: -122.4214, phone: "+1 (415) 555-0102", distance: 1.2, acceptsCategories: ["food", "beverage", "supply"], operatingHours: "24/7" },
  { id: "org-3", name: "St. Mark's Shelter", type: "shelter", address: "Thaprerentedelding the 1 loenfeen, rabl-risers", lat: 37.7847, lng: -122.4126, phone: "+1 (415) 555-0103", distance: 1.5, acceptsCategories: ["food", "beverage"], operatingHours: "24/7" },
  { id: "org-4", name: "Pine Street Mission", type: "foodbank", address: "Coplient te Mission, 6ldees", lat: 37.7873, lng: -122.3964, phone: "+1 (415) 555-0104", distance: 2.1, acceptsCategories: ["food", "supply"], operatingHours: "Mon-Fri 9AM-5PM" },
  { id: "org-5", name: "Mission Haven", type: "shelter", address: "1050 Folsom St, San Francisco, CA 94103", lat: 37.7781, lng: -122.4055, phone: "+1 (415) 555-0105", distance: 2.4, acceptsCategories: ["food", "beverage", "supply", "other"], operatingHours: "Mon-Sun 6AM-10PM" },
];

export default function MatchPage() {
  const router = useRouter();
  const [callStates, setCallStates] = useState<OrgCallState[]>(
    orgs.map((org) => ({ org, status: "pending" }))
  );
  const [accepted, setAccepted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const callOrgs = async () => {
      for (let i = 0; i < orgs.length; i++) {
        setCallStates((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "calling" } : s))
        );

        try {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId: orgs[i].id }),
          });
          const data = await res.json();

          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: data.status, message: data.message } : s
            )
          );

          if (data.status === "accepted") {
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

    callOrgs();
  }, [router]);

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
      </BlurFade>

      {/* Mock Map */}
      <BlurFade delay={0.1}>
        <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative h-52">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-50">
            {/* Map lines */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-8 left-12 h-1 w-32 bg-teal-300/60 rounded" />
              <div className="absolute top-14 left-6 h-0.5 w-40 bg-teal-200/50 rounded" />
              <div className="absolute top-24 left-16 h-0.5 w-28 bg-teal-300/40 rounded" />
              <div className="absolute bottom-16 right-8 h-1 w-24 bg-teal-200/50 rounded" />
              <div className="absolute bottom-24 right-16 h-0.5 w-32 bg-teal-300/40 rounded" />
              <div className="absolute top-20 right-12 h-0.5 w-20 bg-teal-200/60 rounded" />
            </div>
            {/* Map pins */}
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

      {/* Org List */}
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
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{cs.org.name}</p>
                      <p className="text-xs text-gray-400">{cs.org.address}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.classes}`}>
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

      {/* Submit / status */}
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
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4 text-teal-500" />
              AI agent is calling organizations...
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  );
}
