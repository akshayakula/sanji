"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Check, Edit2, MapPin, Package, ArrowRight, Loader2 } from "lucide-react";
import { getDonationState, setDonationState } from "@/lib/donation-store";
import { DonationItem } from "@/types";

export default function ReviewPage() {
  const router = useRouter();
  const [state, setState] = useState(getDonationState());
  const [editingId, setEditingId] = useState<string | null>(null);
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
    // Small delay then navigate to matching
    await new Promise((r) => setTimeout(r, 500));
    router.push("/match");
  };

  if (!state.items.length) return null;

  const categoryColors: Record<string, string> = {
    food: "bg-orange-50 text-orange-700 border-orange-200",
    beverage: "bg-blue-50 text-blue-700 border-blue-200",
    supply: "bg-purple-50 text-purple-700 border-purple-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BlurFade delay={0.1}>
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <Check className="h-4 w-4" />
          Photo analyzed successfully
        </div>
        <h1 className="mt-2 text-3xl font-bold">Review Detected Items</h1>
        <p className="mt-2 text-muted-foreground">
          Edit quantities or remove items that aren&apos;t right.
        </p>
      </BlurFade>

      {/* Image preview */}
      {state.imagePreview && (
        <BlurFade delay={0.15}>
          <Card className="relative mt-6 overflow-hidden">
            <img
              src={state.imagePreview}
              alt="Donation items"
              className="h-48 w-full object-cover"
            />
          </Card>
        </BlurFade>
      )}

      {/* Items list */}
      <div className="mt-6 space-y-3">
        {state.items.map((item, i) => (
          <BlurFade key={item.id} delay={0.2 + i * 0.05}>
            <Card className="relative flex items-center gap-4 p-4">
              {i === 0 && (
                <BorderBeam size={150} duration={10} colorFrom="#10b981" colorTo="#059669" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge
                    variant="outline"
                    className={categoryColors[item.category] || ""}
                  >
                    {item.category}
                  </Badge>
                </div>
                {editingId === item.id ? (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20"
                    />
                    <span className="self-center text-sm text-muted-foreground">
                      {item.unit}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() =>
                    setEditingId(editingId === item.id ? null : item.id)
                  }
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </Button>
              </div>
            </Card>
          </BlurFade>
        ))}
      </div>

      {/* Location summary */}
      <BlurFade delay={0.4}>
        <Card className="mt-6 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium">Pickup Location</p>
              <p className="text-sm text-muted-foreground">
                {state.location?.address}
              </p>
              {state.pickupInstructions && (
                <p className="mt-1 text-sm text-muted-foreground italic">
                  &ldquo;{state.pickupInstructions}&rdquo;
                </p>
              )}
            </div>
          </div>
        </Card>
      </BlurFade>

      {/* Summary */}
      <BlurFade delay={0.45}>
        <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>
              <strong>{state.items.length}</strong> items ·{" "}
              <strong>{state.items.reduce((s, i) => s + i.quantity, 0)}</strong>{" "}
              total units
            </span>
          </div>
        </div>
      </BlurFade>

      {/* Confirm */}
      <BlurFade delay={0.5}>
        <Button
          onClick={handleConfirm}
          disabled={submitting || state.items.length === 0}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding nearby organizations...
            </>
          ) : (
            <>
              Find Recipients <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </BlurFade>
    </div>
  );
}
