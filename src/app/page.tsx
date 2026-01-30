import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { WordRotate } from "@/components/ui/word-rotate";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Camera, MapPin, Phone, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Snap a Photo",
    desc: "Take a picture of your surplus food, packaged goods, or supplies.",
  },
  {
    icon: MapPin,
    title: "We Find Recipients",
    desc: "AI locates the nearest shelters, kitchens, and community fridges.",
  },
  {
    icon: Phone,
    title: "AI Confirms Acceptance",
    desc: "Our calling agent contacts orgs to confirm they can receive your items.",
  },
  {
    icon: Truck,
    title: "Courier Picks Up",
    desc: "A delivery driver picks up from you and drops off — no effort needed.",
  },
];

const stats = [
  { value: 30, suffix: "s", label: "Average donation time" },
  { value: 119, suffix: "M", label: "Lbs of food wasted daily in the US" },
  { value: 5, suffix: "", label: "Orgs contacted per donation" },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <DotPattern className="absolute inset-0 opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center md:py-36">
          <BlurFade delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Now accepting donations in SF Bay Area
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Surplus to service{" "}
              <WordRotate
                words={["in minutes", "with one photo", "effortlessly"]}
                className="text-emerald-600"
              />
            </h1>
          </BlurFade>

          <BlurFade delay={0.3}>
            <p className="max-w-xl text-lg text-muted-foreground">
              Snap a photo of extra food or supplies. AI identifies what you have,
              finds nearby shelters, and dispatches a courier. Done.
            </p>
          </BlurFade>

          <BlurFade delay={0.4}>
            <div className="flex gap-3">
              <Link href="/donate">
                <ShimmerButton className="h-12 px-8" shimmerColor="#10b981" shimmerSize="0.1em" background="rgba(5, 150, 105, 1)">
                  <span className="flex items-center gap-2 text-white font-medium">
                    Start Donating <ArrowRight className="h-4 w-4" />
                  </span>
                </ShimmerButton>
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center gap-2 rounded-lg border px-6 text-sm font-medium hover:bg-muted transition-colors"
              >
                How it Works
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 py-10">
              <span className="text-4xl font-bold">
                <NumberTicker value={stat.value} />
                {stat.suffix}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <BlurFade delay={0.1}>
            <h2 className="text-center text-3xl font-bold">How PantryRun Works</h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
              Four simple steps from surplus to someone who needs it.
            </p>
          </BlurFade>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <BlurFade key={step.title} delay={0.15 + i * 0.1}>
                <div className="group relative rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="absolute right-4 top-4 font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-emerald-600 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h2 className="text-3xl font-bold">Ready to make a difference?</h2>
          <p className="max-w-md text-emerald-100">
            It takes less than 30 seconds to start a donation. Your surplus becomes
            someone&apos;s meal.
          </p>
          <Link href="/donate">
            <ShimmerButton className="h-12 px-8" shimmerColor="#ffffff" shimmerSize="0.1em" background="rgba(255,255,255,0.15)">
              <span className="flex items-center gap-2 font-medium">
                Donate Now <ArrowRight className="h-4 w-4" />
              </span>
            </ShimmerButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>PantryRun — Hackathon Project</span>
          <span>Made with care for communities in need.</span>
        </div>
      </footer>
    </div>
  );
}
