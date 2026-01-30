"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { CheckCircle2, Truck, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { getDonationState, setDonationState } from "@/lib/donation-store";

export default function MatchResultPage() {
  const router = useRouter();
  const [state] = useState(getDonationState());
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (!state.matchedOrg) {
      router.replace("/donate");
    }
  }, [state.matchedOrg, router]);

  const handleDispatch = async () => {
    setDispatching(true);
    try {
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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BlurFade delay={0.1}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Match Found!</h1>
          <p className="mt-2 text-muted-foreground">
            A recipient has agreed to accept your donation.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <Card className="relative mt-8 overflow-hidden p-6">
          <BorderBeam size={200} duration={8} colorFrom="#10b981" colorTo="#059669" />
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-lg">{state.matchedOrg.name}</p>
                <p className="text-sm text-muted-foreground">{state.matchedOrg.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{state.matchedOrg.operatingHours}</p>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{state.matchedOrg.distance} miles away</p>
            </div>
          </div>
        </Card>
      </BlurFade>

      <BlurFade delay={0.3}>
        <Button
          onClick={handleDispatch}
          disabled={dispatching}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
        >
          {dispatching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Dispatching courier...
            </>
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Dispatch Courier <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </BlurFade>
    </div>
  );
}
