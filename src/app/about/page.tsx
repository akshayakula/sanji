import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { Camera, Brain, Phone, Truck, Shield, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Camera,
    title: "1. Snap a Photo",
    desc: "Take a quick picture of your surplus food, packaged goods, or supplies. Our interface supports drag-and-drop, mobile camera, and gallery uploads.",
  },
  {
    icon: Brain,
    title: "2. AI Identifies Items",
    desc: "A vision model analyzes the photo and identifies each item — type, quantity, and category. You can edit the results before confirming.",
  },
  {
    icon: Phone,
    title: "3. AI Calls Recipients",
    desc: "Based on your location, we find the 5 closest shelters, kitchens, and community fridges. An AI calling agent contacts them to confirm availability.",
  },
  {
    icon: Truck,
    title: "4. Courier Dispatched",
    desc: "Once a recipient accepts, we dispatch a courier to pick up from your location and deliver directly. You can track the delivery in real time.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <BlurFade delay={0.1}>
        <h1 className="text-4xl font-bold">How PantryRun Works</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          We make donating surplus food and supplies as easy as taking a photo.
          Here&apos;s the full flow.
        </p>
      </BlurFade>

      <div className="mt-12 space-y-6">
        {steps.map((step, i) => (
          <BlurFade key={step.title} delay={0.15 + i * 0.1}>
            <Card className="flex gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.desc}</p>
              </div>
            </Card>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={0.6}>
        <Card className="mt-12 border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex gap-4">
            <Shield className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <h3 className="font-semibold">Safety &amp; Ethics</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                PantryRun is designed with food safety in mind. We only facilitate donations of
                packaged, non-expired items. All recipient organizations are verified community
                partners. No personal data is shared without consent.
              </p>
            </div>
          </div>
        </Card>
      </BlurFade>

      <BlurFade delay={0.7}>
        <div className="mt-12 flex flex-col items-center text-center">
          <Heart className="h-8 w-8 text-emerald-600" />
          <h2 className="mt-3 text-2xl font-bold">Ready to help?</h2>
          <p className="mt-2 text-muted-foreground">
            It takes less than 30 seconds.
          </p>
          <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Link href="/donate">Start a Donation</Link>
          </Button>
        </div>
      </BlurFade>
    </div>
  );
}
