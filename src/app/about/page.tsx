"use client";

import { motion } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { Camera, Brain, Phone, Truck, Shield, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const steps = [
  {
    icon: Camera,
    num: "01",
    title: "Snap a Photo",
    desc: "Take a quick picture of your surplus food, packaged goods, or supplies. Our interface supports drag-and-drop, mobile camera, and gallery uploads.",
  },
  {
    icon: Brain,
    num: "02",
    title: "AI Identifies Items",
    desc: "A vision model analyzes the photo and identifies each item — type, quantity, and category. You can edit the results before confirming.",
  },
  {
    icon: Phone,
    num: "03",
    title: "AI Calls Recipients",
    desc: "Based on your location, we find the 5 closest shelters, kitchens, and community fridges. An AI calling agent contacts them to confirm availability.",
  },
  {
    icon: Truck,
    num: "04",
    title: "Courier Dispatched",
    desc: "Once a recipient accepts, we dispatch a courier to pick up from your location and deliver directly. You can track the delivery in real time.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <BlurFade delay={0.05}>
        <span className="inline-block text-sm font-semibold text-teal-600 tracking-wide uppercase mb-3">
          How it works
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          From surplus to service,
          <br />
          <span className="text-gradient-teal">in four steps</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-lg">
          We make donating surplus food and supplies as easy as taking a photo.
          Here&apos;s the full flow.
        </p>
      </BlurFade>

      <div className="mt-16 space-y-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
          >
            <div className="group flex gap-5 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-400 tracking-wide">
                    {step.num}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BlurFade delay={0.5}>
        <div className="mt-12 rounded-2xl border border-teal-200 bg-teal-50/50 p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Safety & Ethics</h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Dashwill is designed with food safety in mind. We only facilitate donations of
                packaged, non-expired items. All recipient organizations are verified community
                partners. No personal data is shared without consent.
              </p>
            </div>
          </div>
        </div>
      </BlurFade>

      <BlurFade delay={0.6}>
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 mb-4">
            <Heart className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold">Ready to help?</h2>
          <p className="mt-2 text-gray-500">
            It takes less than 30 seconds.
          </p>
          <div className="mt-5">
            <Link href="/donate">
              <ShimmerButton
                className="h-12 px-8 rounded-full"
                shimmerColor="rgba(255,255,255,0.3)"
                shimmerSize="0.1em"
                background="linear-gradient(135deg, #0D9488, #14B8A6)"
              >
                <span className="flex items-center gap-2 text-white font-semibold">
                  Start a Donation <ArrowRight className="h-4 w-4" />
                </span>
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
