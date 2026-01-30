"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";
import { Ripple } from "@/components/ui/ripple";
import { Camera, MapPin, Phone, Truck, ArrowRight, Sparkles, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Snap a Photo",
    desc: "Take a picture of your surplus food, packaged goods, or supplies. Our AI instantly identifies every item.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: MapPin,
    title: "We Find Recipients",
    desc: "Based on your location, we find the nearest shelters, kitchens, and community fridges that need your items.",
    color: "from-teal-400 to-teal-500",
  },
  {
    icon: Phone,
    title: "AI Confirms Acceptance",
    desc: "Our AI calling agent contacts organizations in real-time to confirm they can accept your specific donation.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Truck,
    title: "Courier Picks Up",
    desc: "A delivery driver is dispatched to your location, picks up the items, and delivers them directly. Zero effort.",
    color: "from-emerald-500 to-teal-500",
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

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-teal-200/40 via-teal-300/30 to-transparent blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-teal-100/50 to-transparent blur-3xl" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[500px] rounded-full bg-gradient-to-t from-teal-50/60 to-transparent blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/60 px-4 py-1.5 text-sm font-medium text-teal-700 mb-6"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Food Rescue
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
              >
                Snap. Match.{" "}
                <span className="text-gradient-teal">Deliver.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-6 max-w-md text-lg text-gray-500 leading-relaxed"
              >
                Donate extra food or supplies by snapping a photo. Dashwill finds
                nearby shelters, and sends a courier instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/donate">
                  <ShimmerButton
                    className="h-13 px-8 rounded-full"
                    shimmerColor="rgba(255,255,255,0.3)"
                    shimmerSize="0.1em"
                    background="linear-gradient(135deg, #0D9488, #14B8A6)"
                  >
                    <span className="flex items-center gap-2 text-white font-semibold text-base">
                      Start Donating <ArrowRight className="h-4 w-4" />
                    </span>
                  </ShimmerButton>
                </Link>
                <Link
                  href="/about"
                  className="group inline-flex h-13 items-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                >
                  How it Works
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Phone mockup / visual */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="relative flex justify-center"
            >
              <div className="relative">
                {/* Phone frame */}
                <div className="relative w-[280px] md:w-[320px] rounded-[2.5rem] border-[8px] border-gray-900 bg-white shadow-elevated overflow-hidden">
                  {/* Phone screen content */}
                  <div className="aspect-[9/17] bg-gradient-to-br from-teal-50 to-white p-4">
                    {/* Mini nav */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 rounded-md gradient-teal flex items-center justify-center">
                        <Truck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-semibold text-gray-900">Dashwill</span>
                    </div>

                    {/* Mock map area */}
                    <div className="rounded-xl bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-50 h-32 mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 left-6 h-2 w-16 bg-teal-300/50 rounded" />
                        <div className="absolute top-8 left-3 h-1.5 w-24 bg-teal-200/50 rounded" />
                        <div className="absolute top-14 left-8 h-1.5 w-20 bg-teal-300/40 rounded" />
                        <div className="absolute bottom-6 right-4 h-2 w-14 bg-teal-200/50 rounded" />
                      </div>
                      {/* Map pins */}
                      <div className="absolute top-6 right-8">
                        <div className="h-5 w-5 rounded-full bg-teal-500 border-2 border-white shadow-lg flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-8 left-10">
                        <div className="h-5 w-5 rounded-full bg-teal-600 border-2 border-white shadow-lg flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="absolute top-16 right-16">
                        <div className="h-4 w-4 rounded-full bg-teal-400 border-2 border-white shadow-md" />
                      </div>
                    </div>

                    {/* Mock food image */}
                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 h-24 mb-3 flex items-center justify-center border border-amber-100/50">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🥪🧃🍌</div>
                        <p className="text-[10px] text-gray-500">12 items detected</p>
                      </div>
                    </div>

                    {/* Mock items */}
                    <div className="space-y-2">
                      {["Sandwiches", "Water Bottles", "Granola Bars"].map((item, i) => (
                        <div key={item} className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-3 py-2 shadow-sm">
                          <span className="text-[11px] font-medium text-gray-700">{item}</span>
                          <span className="text-[10px] text-teal-600 font-semibold">{[12, 6, 10][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badges around phone */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -left-8 rounded-xl bg-white shadow-card-hover border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Camera className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-900">Photo Analyzed</p>
                      <p className="text-[9px] text-gray-400">5 items found</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-2 -right-6 rounded-xl bg-white shadow-card-hover border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Truck className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-900">Courier ETA</p>
                      <p className="text-[9px] text-gray-400">12 minutes</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-gray-100">
          {[
            { value: 1, suffix: "M+", label: "Donations matched" },
            { value: 120, suffix: "M", label: "Food wasted daily in the US" },
            { value: 30, prefix: "<", suffix: "s", label: "Average donation time" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 py-10 md:py-12">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                {stat.prefix}
                <NumberTicker value={stat.value} className="text-teal-600" />
                <span className="text-teal-600">{stat.suffix}</span>
              </span>
              <span className="text-xs md:text-sm text-gray-400 text-center px-2">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-teal-50/50 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-teal-600 tracking-wide uppercase mb-3">
                How it works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Four steps from surplus to service
              </h2>
              <p className="mt-4 mx-auto max-w-lg text-gray-500">
                The entire process takes less than 30 seconds of your time.
                We handle everything else.
              </p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
              >
                <div className="group relative rounded-2xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  <div className="flex items-start gap-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-400">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / MARQUEE ===== */}
      <section className="border-y border-gray-100 bg-white py-10 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ "--duration": "30s" } as React.CSSProperties}>
          {[...Array(2)].flatMap((_, setIdx) =>
            [
              "Trusted by 50+ shelters in DC",
              "AI-powered food matching",
              "Zero waste delivery",
              "Community-first platform",
              "Instant courier dispatch",
              "Photo-to-donation in 30s",
            ].map((text, i) => (
              <span
                key={`${setIdx}-${i}`}
                className="inline-flex items-center gap-2 text-sm text-gray-400 font-medium"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                {text}
              </span>
            ))
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 overflow-hidden">
          <Ripple mainCircleSize={300} mainCircleOpacity={0.1} numCircles={6} />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            Ready to make a difference?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md text-teal-100 text-lg"
          >
            It takes less than 30 seconds to start a donation. Your surplus
            becomes someone&apos;s next meal.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/donate">
              <ShimmerButton
                className="h-14 px-10 rounded-full"
                shimmerColor="rgba(255,255,255,0.4)"
                shimmerSize="0.12em"
                background="rgba(255,255,255,0.15)"
                borderRadius="9999px"
              >
                <span className="flex items-center gap-2 font-semibold text-base text-white">
                  Start Donating <ArrowRight className="h-5 w-5" />
                </span>
              </ShimmerButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-teal">
              <Truck className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">Dashwill</span>
          </div>
          <p className="text-sm text-gray-400">
            Built with care for communities in need.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-teal-600 transition-colors">How it Works</Link>
            <Link href="/donate" className="hover:text-teal-600 transition-colors">Donate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
