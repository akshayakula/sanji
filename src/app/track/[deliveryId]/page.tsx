"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Truck, Package, MapPin, User, Phone, Clock, CheckCircle2 } from "lucide-react";
import { Delivery } from "@/types";

const statusSteps = [
  { key: "dispatching", label: "Dispatching", icon: Clock },
  { key: "driver_assigned", label: "Driver Assigned", icon: User },
  { key: "pickup", label: "Picking Up", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function TrackPage() {
  const params = useParams();
  const deliveryId = params.deliveryId as string;
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchDelivery = async () => {
      const res = await fetch(`/api/delivery/${deliveryId}`);
      const data = await res.json();
      setDelivery(data);
    };
    fetchDelivery();
  }, [deliveryId]);

  // Simulate progress
  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 5000),
      setTimeout(() => setCurrentStep(3), 8000),
      setTimeout(() => setCurrentStep(4), 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BlurFade delay={0.1}>
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <Truck className="h-4 w-4" />
          Live Tracking
        </div>
        <h1 className="mt-2 text-3xl font-bold">Delivery in Progress</h1>
        <p className="mt-2 text-muted-foreground">
          Tracking ID: <span className="font-mono">{deliveryId}</span>
        </p>
      </BlurFade>

      {/* Progress Steps */}
      <BlurFade delay={0.2}>
        <Card className="relative mt-8 overflow-hidden p-6">
          <BorderBeam size={200} duration={12} colorFrom="#10b981" colorTo="#059669" />
          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const isComplete = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isComplete
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-muted-foreground/30 text-muted-foreground/30"
                      } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`h-10 w-0.5 transition-colors duration-500 ${
                          i < currentStep ? "bg-emerald-600" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-8 ${i === statusSteps.length - 1 ? "pb-0" : ""}`}>
                    <p
                      className={`font-medium transition-colors ${
                        isComplete ? "text-foreground" : "text-muted-foreground/50"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <Badge className="mt-1 bg-emerald-50 text-emerald-700 border-emerald-200" variant="outline">
                        Current
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </BlurFade>

      {/* Driver info */}
      {delivery && currentStep >= 1 && (
        <BlurFade delay={0.3}>
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{delivery.driverName}</p>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {delivery.driverPhone}
              </div>
            </div>
          </Card>
        </BlurFade>
      )}

      {/* Route info */}
      {delivery && (
        <BlurFade delay={0.35}>
          <Card className="mt-4 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{delivery.pickupAddress}</p>
              </div>
            </div>
            <div className="ml-1 h-6 border-l border-dashed border-muted-foreground/30" />
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Dropoff — {delivery.orgName}</p>
                <p className="text-sm font-medium">{delivery.dropoffAddress}</p>
              </div>
            </div>
          </Card>
        </BlurFade>
      )}

      {/* ETA */}
      {delivery && currentStep < 4 && (
        <BlurFade delay={0.4}>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Estimated arrival: {delivery.estimatedArrival}
          </div>
        </BlurFade>
      )}

      {currentStep === 4 && (
        <BlurFade delay={0.1}>
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Delivered!</h2>
            <p className="mt-2 text-muted-foreground">
              Your donation has been successfully delivered. Thank you for making a difference.
            </p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
