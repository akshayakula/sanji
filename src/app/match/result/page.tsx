"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { CheckCircle2, Truck, MapPin, Clock, ArrowRight, Loader2, Navigation, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getDonationState, setDonationState } from "@/lib/donation-store";

export default function MatchResultPage() {
  const router = useRouter();
  const [state] = useState(getDonationState());
  const [dispatching, setDispatching] = useState(false);
  const [pickupInstructions, setPickupInstructions] = useState("");

  useEffect(() => {
    if (!state.matchedOrg) {
      router.replace("/donate");
    }
  }, [state.matchedOrg, router]);

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      setDonationState({ pickupInstructions: pickupInstructions.trim() });
      const res = await fetch("/api/delivery", { method: "POST" });
      const data = await res.json();
      setDonationState({ deliveryId: data.id });
      router.push(`/track/${data.id}`);
    } catch {
      alert("Failed to dispatch courier.");
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
        <button
          onClick={handleDispatch}
          disabled={dispatching}
          className="mt-8 w-full h-14 rounded-2xl gradient-teal text-white font-semibold text-base shadow-teal disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {dispatching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Dispatching courier...
            </>
          ) : (
            <>
              <Truck className="h-5 w-5" />
              Track Order <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </BlurFade>
    </div>
  );
}
