"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { CheckCircle2, Truck, MapPin, Clock, ArrowRight, Loader2, Navigation, MessageSquare, Receipt } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getDonationState, setDonationState } from "@/lib/donation-store";

interface ParsedConfirmation {
  pickup?: string | null;
  dropoff?: string | null;
  eta?: string | null;
  price?: string | null;
  status?: string | null;
  summary?: string | null;
}

export default function MatchResultPage() {
  const router = useRouter();
  const [state] = useState(getDonationState());
  const [dispatching, setDispatching] = useState(false);
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [parsedConfirmation, setParsedConfirmation] = useState<ParsedConfirmation | null>(null);
  const pickupDropoffCalled = useRef(false);

  useEffect(() => {
    if (!state.matchedOrg) {
      router.replace("/donate");
    }
  }, [state.matchedOrg, router]);

  // When we land on match found, call pickup-dropoff (default addresses)
  useEffect(() => {
    if (!state.matchedOrg || pickupDropoffCalled.current) return;
    pickupDropoffCalled.current = true;
    fetch("/api/local/pickup-dropoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  }, [state.matchedOrg]);

  const handleDispatch = async () => {
    setDispatching(true);
    setParsedConfirmation(null);
    const id = "del-" + Math.random().toString(36).substring(2, 8);
    setDonationState({ pickupInstructions: pickupInstructions.trim(), deliveryId: id });
    try {
      // Show loader for 30 seconds
      await new Promise((r) => setTimeout(r, 30000));
      const confirmRes = await fetch("/api/local/confirm-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!confirmRes.ok) {
        setParsedConfirmation({ summary: "Your order has been submitted. You can track it below." });
        return;
      }
      const contentRes = await fetch("/api/local/content");
      if (!contentRes.ok) {
        setParsedConfirmation({ summary: "Your order has been submitted. You can track it below." });
        return;
      }
      const { html } = await contentRes.json().catch(() => ({ html: "" }));
      const parseRes = await fetch("/api/delivery/parse-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!parseRes.ok) {
        setParsedConfirmation({ summary: "Your order has been submitted. You can track it below." });
        return;
      }
      const parsed = (await parseRes.json()) as ParsedConfirmation;
      setParsedConfirmation(parsed);
    } catch {
      setParsedConfirmation({ summary: "Your order has been submitted. You can track it below." });
    } finally {
      setDispatching(false);
    }
  };

  if (!state.matchedOrg) return null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      {/* Hero banner with gradient */}
      <BlurFade delay={0.1}>
        <div className="relative rounded-2xl overflow-hidden h-56 mb-8">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          {/* Mock map overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-12 h-1 w-32 bg-white/40 rounded" />
            <div className="absolute top-16 left-6 h-0.5 w-40 bg-white/30 rounded" />
            <div className="absolute bottom-16 right-8 h-1 w-24 bg-white/30 rounded" />
            <div className="absolute top-24 right-16 h-0.5 w-28 bg-white/20 rounded" />
          </div>
          {/* Car / delivery icon */}
          <div className="absolute bottom-8 left-8">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30"
            >
              <Truck className="h-7 w-7 text-white" />
            </motion.div>
          </div>
          {/* Pin */}
          <div className="absolute top-10 right-12">
            <div className="h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-teal-600" />
            </div>
          </div>
          {/* Route line */}
          <div className="absolute top-14 right-20 left-20 h-0.5 bg-white/30" style={{ transform: "rotate(-10deg)" }}>
            <div className="absolute inset-0 bg-white/60 rounded" style={{ width: "60%" }} />
          </div>
        </div>
      </BlurFade>

      {/* Match Found Card */}
      <BlurFade delay={0.2}>
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Match Found!</h1>
        </div>
      </BlurFade>

      <BlurFade delay={0.3}>
        <div className="relative rounded-2xl bg-white border border-gray-100 p-6 shadow-card-hover overflow-hidden">
          <BorderBeam size={200} duration={8} colorFrom="#0D9488" colorTo="#14B8A6" />

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-xl shrink-0">
              🍳
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{state.matchedOrg.name}</h2>
              <p className="text-sm text-gray-400">{state.matchedOrg.address}</p>
              <p className="text-sm text-gray-400 mt-0.5">
                {state.matchedOrg.operatingHours} &middot; {state.matchedOrg.distance} mi away
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1">
              <Navigation className="h-3 w-3 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">{state.matchedOrg.distance} mile</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1">
              <Clock className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">{state.matchedOrg.operatingHours}</span>
            </div>
          </div>

          {/* Items summary */}
          {state.items.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items to deliver</p>
              <div className="flex flex-wrap gap-1.5">
                {state.items.map((item) => (
                  <span key={item.id} className="inline-flex items-center rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {item.name} &times; {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </BlurFade>

      {/* Pickup Instructions */}
      <BlurFade delay={0.35}>
        <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-teal-600" />
            <label className="text-sm font-semibold text-gray-900">
              Pickup Instructions{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
          </div>
          <Textarea
            placeholder="e.g., Ring buzzer #3, items in lobby..."
            value={pickupInstructions}
            onChange={(e) => setPickupInstructions(e.target.value)}
            className="rounded-xl border-gray-200 focus:border-teal-400 focus:ring-teal-400 resize-none"
            rows={3}
          />
        </div>
      </BlurFade>

      {/* CTA */}
      <BlurFade delay={0.4}>
        {!parsedConfirmation ? (
          <>
            <button
              onClick={handleDispatch}
              disabled={dispatching}
              className="mt-8 w-full h-14 rounded-2xl gradient-teal text-white font-semibold text-base shadow-teal disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {dispatching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Confirming delivery… (30s)
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  Track Order <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl bg-white border border-gray-100 p-6 shadow-card-hover overflow-hidden"
          >
            <BorderBeam size={200} duration={8} colorFrom="#0D9488" colorTo="#14B8A6" />
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-bold text-gray-900">Order confirmation</h2>
            </div>
            {parsedConfirmation.summary && (
              <p className="text-sm text-gray-700 mb-4">{parsedConfirmation.summary}</p>
            )}
            <div className="space-y-2 text-sm">
              {parsedConfirmation.pickup && (
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">Pickup:</span>
                  <span className="text-gray-900">{parsedConfirmation.pickup}</span>
                </div>
              )}
              {parsedConfirmation.dropoff && (
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">Dropoff:</span>
                  <span className="text-gray-900">{parsedConfirmation.dropoff}</span>
                </div>
              )}
              {parsedConfirmation.eta && (
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">ETA:</span>
                  <span className="text-gray-900">{parsedConfirmation.eta}</span>
                </div>
              )}
              {parsedConfirmation.price && (
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">Price:</span>
                  <span className="text-gray-900 font-medium">{parsedConfirmation.price}</span>
                </div>
              )}
              {parsedConfirmation.status && (
                <div className="flex gap-2">
                  <span className="text-gray-500 shrink-0">Status:</span>
                  <span className="text-teal-600 font-medium">{parsedConfirmation.status}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => router.push(`/track/${state.deliveryId || "del-pending"}`)}
              className="mt-5 w-full h-12 rounded-xl gradient-teal text-white font-semibold text-sm shadow-teal hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              View tracking
            </button>
          </motion.div>
        )}
      </BlurFade>
    </div>
  );
}
