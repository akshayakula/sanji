"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Phone, CheckCircle2, XCircle, Clock, Building2, Loader2 } from "lucide-react";
import { setDonationState } from "@/lib/donation-store";
import { Organization, CallStatus } from "@/types";

interface OrgCallState {
  org: Organization;
  status: CallStatus;
  message?: string;
}

const orgs: Organization[] = [
  { id: "org-1", name: "Downtown Community Kitchen", type: "kitchen", address: "142 Main St, San Francisco, CA 94105", lat: 37.7897, lng: -122.3942, phone: "+1 (415) 555-0101", distance: 0.8, acceptsCategories: ["food", "beverage"], operatingHours: "Mon-Sat 7AM-8PM" },
  { id: "org-2", name: "Mission District Shelter", type: "shelter", address: "890 Valencia St, San Francisco, CA 94110", lat: 37.7589, lng: -122.4214, phone: "+1 (415) 555-0102", distance: 1.2, acceptsCategories: ["food", "beverage", "supply"], operatingHours: "24/7" },
  { id: "org-3", name: "Tenderloin Community Fridge", type: "fridge", address: "321 Ellis St, San Francisco, CA 94102", lat: 37.7847, lng: -122.4126, phone: "+1 (415) 555-0103", distance: 1.5, acceptsCategories: ["food", "beverage"], operatingHours: "24/7 (outdoor access)" },
  { id: "org-4", name: "Bay Area Food Bank", type: "foodbank", address: "500 Howard St, San Francisco, CA 94105", lat: 37.7873, lng: -122.3964, phone: "+1 (415) 555-0104", distance: 2.1, acceptsCategories: ["food", "supply"], operatingHours: "Mon-Fri 9AM-5PM" },
  { id: "org-5", name: "SoMa Hope Center", type: "shelter", address: "1050 Folsom St, San Francisco, CA 94103", lat: 37.7781, lng: -122.4055, phone: "+1 (415) 555-0105", distance: 2.4, acceptsCategories: ["food", "beverage", "supply", "other"], operatingHours: "Mon-Sun 6AM-10PM" },
];

export default function MatchPage() {
  const router = useRouter();
  const [callStates, setCallStates] = useState<OrgCallState[]>(
    orgs.map((org) => ({ org, status: "pending" }))
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const callOrgs = async () => {
      for (let i = 0; i < orgs.length; i++) {
        // Set to calling
        setCallStates((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "calling" } : s))
        );

        // Call API
        try {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orgId: orgs[i].id }),
          });
          const data = await res.json();

          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: data.status, message: data.message } : s
            )
          );

          if (data.status === "accepted") {
            setDonationState({ matchedOrg: orgs[i] });
            // Wait a moment then navigate
            setTimeout(() => router.push("/match/result"), 1500);
            return;
          }
        } catch {
          setCallStates((prev) =>
            prev.map((s, idx) =>
              idx === i ? { ...s, status: "no_answer", message: "Call failed" } : s
            )
          );
        }
      }
    };

    callOrgs();
  }, [router]);

  const statusIcon = (status: CallStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "calling":
        return <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />;
      case "no_answer":
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
  };

  const statusLabel = (status: CallStatus) => {
    switch (status) {
      case "pending": return "Waiting";
      case "calling": return "Calling...";
      case "no_answer": return "No Answer";
      case "declined": return "Declined";
      case "accepted": return "Accepted";
    }
  };

  const statusBadgeClass = (status: CallStatus) => {
    switch (status) {
      case "pending": return "bg-muted text-muted-foreground";
      case "calling": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "no_answer": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "declined": return "bg-red-50 text-red-700 border-red-200";
      case "accepted": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const typeLabel: Record<string, string> = {
    kitchen: "Community Kitchen",
    shelter: "Shelter",
    fridge: "Community Fridge",
    foodbank: "Food Bank",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BlurFade delay={0.1}>
        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <Phone className="h-4 w-4" />
          AI Calling Agent Active
        </div>
        <h1 className="mt-2 text-3xl font-bold">Finding a Recipient</h1>
        <p className="mt-2 text-muted-foreground">
          Our AI agent is calling nearby organizations to find one that can accept your donation.
        </p>
      </BlurFade>

      <div className="mt-8 space-y-3">
        {callStates.map((cs, i) => (
          <BlurFade key={cs.org.id} delay={0.15 + i * 0.05}>
            <Card
              className={`p-4 transition-all duration-500 ${
                cs.status === "calling" ? "ring-2 ring-emerald-200 shadow-md" : ""
              } ${cs.status === "accepted" ? "ring-2 ring-emerald-500 shadow-lg bg-emerald-50/50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{cs.org.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeLabel[cs.org.type]} · {cs.org.distance} mi
                    </p>
                    {cs.message && (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        {cs.message}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1.5 ${statusBadgeClass(cs.status)}`}
                >
                  {statusIcon(cs.status)}
                  {statusLabel(cs.status)}
                </Badge>
              </div>
            </Card>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
