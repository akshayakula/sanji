"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Check, MapPin, Package, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { getDonationState, setDonationState } from "@/lib/donation-store";
import { DonationItem } from "@/types";

export default function ReviewPage() {
  const router = useRouter();
  const [state, setState] = useState(getDonationState());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = getDonationState();
    if (!s.items.length) {
      router.replace("/donate");
    }
    setState(s);
  }, [router]);

  const updateItem = (id: string, updates: Partial<DonationItem>) => {
    const newItems = state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setState((prev) => ({ ...prev, items: newItems }));
    setDonationState({ items: newItems });
  };

  const removeItem = (id: string) => {
    const newItems = state.items.filter((item) => item.id !== id);
    setState((prev) => ({ ...prev, items: newItems }));
    setDonationState({ items: newItems });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/match");
  };

  if (!state.items.length) return null;

  const categoryColors: Record<string, string> = {
    food: "bg-orange-50 text-orange-600 border-orange-200",
    beverage: "bg-blue-50 text-blue-600 border-blue-200",
    supply: "bg-purple-50 text-purple-600 border-purple-200",
    other: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const categoryIcons: Record<string, string> = {
    food: "🍽️", beverage: "🥤", supply: "📦", other: "📋",
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      <BlurFade delay={0.05}>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/60 px-3 py-1 text-sm font-medium text-teal-700 mb-4">
          <Check className="h-3.5 w-3.5" />
          Photo analyzed
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Review Your Donation</h1>
        <p className="mt-2 text-gray-500">
          Confirm the detected items and location before we find recipients.
        </p>
      </BlurFade>

      {/* Image preview */}
      {state.imagePreview && (
        <BlurFade delay={0.1}>
          <div className="relative mt-6 rounded-2xl overflow-hidden shadow-card border border-gray-100">
            <BorderBeam size={200} duration={10} colorFrom="#0D9488" colorTo="#14B8A6" />
            <img
              src={state.imagePreview}
              alt="Donation items"
              className="h-44 w-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-300" />
              <span className="text-sm font-medium text-white">{state.items.length} items detected</span>
            </div>
          </div>
        </BlurFade>
      )}

      {/* Items */}
      <div className="mt-6 space-y-2.5">
        {state.items.map((item, i) => (
          <BlurFade key={item.id} delay={0.15 + i * 0.04}>
            <motion.div
              layout
              className="group flex items-center gap-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-card-hover transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-lg shrink-0">
                {categoryIcons[item.category] || "📋"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${categoryColors[item.category]}`}>
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                  className="w-14 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm font-semibold text-gray-900 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-lg"
                >
                  ×
                </button>
              </div>
            </motion.div>
          </BlurFade>
        ))}
      </div>

      {/* Location */}
      <BlurFade delay={0.35}>
        <div className="mt-6 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 shrink-0">
              <MapPin className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Pickup Location</p>
              <p className="text-sm text-gray-400">{state.location?.address}</p>
              {state.pickupInstructions && (
                <p className="mt-1 text-sm text-gray-400 italic">
                  &ldquo;{state.pickupInstructions}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      </BlurFade>

      {/* Summary bar */}
      <BlurFade delay={0.4}>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-teal-50/50 border border-teal-100 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-teal-700">
            <Package className="h-4 w-4" />
            <span>
              <strong>{state.items.length}</strong> items &middot;{" "}
              <strong>{state.items.reduce((s, i) => s + i.quantity, 0)}</strong> total units
            </span>
          </div>
        </div>
      </BlurFade>

      {/* Submit */}
      <BlurFade delay={0.45}>
        <button
          onClick={handleConfirm}
          disabled={submitting || state.items.length === 0}
          className="mt-6 w-full h-13 rounded-2xl gradient-teal text-white font-semibold text-base shadow-teal disabled:opacity-40 disabled:shadow-none hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding nearby organizations...
            </>
          ) : (
            <>
              Find Recipients <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </BlurFade>
    </div>
  );
}
