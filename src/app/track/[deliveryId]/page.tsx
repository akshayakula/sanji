"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Truck, Package, MapPin, User, Phone, Clock, CheckCircle2, Navigation } from "lucide-react";
import { Delivery } from "@/types";

const statusSteps = [
  { key: "dispatching", label: "Dispatching", desc: "Finding a nearby driver", icon: Clock },
  { key: "driver_assigned", label: "Driver Assigned", desc: "Driver is on the way to you", icon: User },
  { key: "pickup", label: "Picking Up", desc: "Driver is at your location", icon: Package },
  { key: "in_transit", label: "In Transit", desc: "On the way to recipient", icon: Truck },
  { key: "delivered", label: "Delivered", desc: "Successfully delivered!", icon: CheckCircle2 },
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

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 2500),
      setTimeout(() => setCurrentStep(2), 6000),
      setTimeout(() => setCurrentStep(3), 9000),
      setTimeout(() => setCurrentStep(4), 16000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-16">
      {/* Header with live badge */}
      <BlurFade delay={0.05}>
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            Live Tracking
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery in Progress</h1>
        <p className="mt-1 text-gray-400 text-sm">
          Tracking ID: <span className="font-mono text-gray-500">{deliveryId}</span>
        </p>
      </BlurFade>

      {/* Map visualization */}
      <BlurFade delay={0.1}>
        <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative h-44">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-teal-50/50">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-6 left-10 h-1 w-28 bg-teal-200 rounded" />
              <div className="absolute top-12 left-4 h-0.5 w-36 bg-teal-100 rounded" />
              <div className="absolute bottom-12 right-6 h-1 w-20 bg-teal-200 rounded" />
            </div>
            {/* Animated route */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <motion.path
                d="M 60 120 Q 150 40 280 80 Q 380 110 450 60"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: currentStep / 4 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            {/* Pickup point */}
            <div className="absolute bottom-10 left-12">
              <div className="h-4 w-4 rounded-full bg-teal-500 border-2 border-white shadow-md" />
            </div>
            {/* Delivery point */}
            <div className="absolute top-8 right-16">
              <div className="h-6 w-6 rounded-full bg-teal-600 border-2 border-white shadow-lg flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
              </div>
            </div>
            {/* Moving truck */}
            <motion.div
              animate={{
                left: `${12 + (currentStep / 4) * 65}%`,
                top: `${70 - (currentStep / 4) * 50}%`,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute"
            >
              <div className="h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center border border-teal-100">
                <Truck className="h-4 w-4 text-teal-600" />
              </div>
            </motion.div>
          </div>
        </div>
      </BlurFade>

      {/* Progress Steps */}
      <BlurFade delay={0.2}>
        <div className="relative mt-8 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm overflow-hidden">
          <BorderBeam size={200} duration={12} colorFrom="#0D9488" colorTo="#14B8A6" />
          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const isComplete = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isCurrent ? [1, 1.1, 1] : 1,
                        backgroundColor: isComplete ? "#0D9488" : "#F5F5F5",
                        borderColor: isComplete ? "#0D9488" : "#E5E5E5",
                      }}
                      transition={{
                        scale: { duration: 1.5, repeat: isCurrent ? Infinity : 0 },
                        backgroundColor: { duration: 0.5 },
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isComplete ? "text-white" : "text-gray-300"
                      }`}
                    >
                      <step.icon className="h-4 w-4" />
                    </motion.div>
                    {i < statusSteps.length - 1 && (
                      <motion.div
                        animate={{
                          backgroundColor: i < currentStep ? "#0D9488" : "#E5E5E5",
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-10 w-0.5 rounded-full"
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${i === statusSteps.length - 1 ? "pb-0" : ""}`}>
                    <p className={`font-semibold text-sm transition-colors ${isComplete ? "text-gray-900" : "text-gray-300"}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs transition-colors ${isComplete ? "text-gray-400" : "text-gray-200"}`}>
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-medium text-teal-700"
                      >
                        <span className="h-1 w-1 rounded-full bg-teal-500 animate-pulse" />
                        Current
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BlurFade>

      {/* Driver info */}
      <AnimatePresence>
        {delivery && currentStep >= 1 && (
          <BlurFade delay={0.3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{delivery.driverName}</p>
                    <p className="text-xs text-gray-400">Your courier</p>
                  </div>
                </div>
                <a className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-colors">
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              </div>
            </motion.div>
          </BlurFade>
        )}
      </AnimatePresence>

      {/* Route info */}
      {delivery && (
        <BlurFade delay={0.35}>
          <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0">
                <div className="h-3 w-3 rounded-full bg-teal-500 border-2 border-teal-200" />
                <div className="h-10 w-px border-l border-dashed border-gray-300" />
                <div className="flex h-5 w-5 items-center justify-center">
                  <MapPin className="h-4 w-4 text-teal-600" />
                </div>
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-medium text-gray-900">{delivery.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dropoff &middot; {delivery.orgName}</p>
                  <p className="text-sm font-medium text-gray-900">{delivery.dropoffAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      )}

      {/* ETA */}
      {delivery && currentStep < 4 && (
        <BlurFade delay={0.4}>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Navigation className="h-4 w-4 text-teal-500" />
            Estimated arrival: <span className="font-semibold text-gray-600">{delivery.estimatedArrival}</span>
          </div>
        </BlurFade>
      )}

      {/* Delivered celebration */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mt-8 rounded-2xl gradient-teal p-8 text-center text-white"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Delivered!</h2>
          <p className="mt-2 text-teal-100">
            Your donation has been successfully delivered. Thank you for making a difference.
          </p>
        </motion.div>
      )}
    </div>
  );
}
