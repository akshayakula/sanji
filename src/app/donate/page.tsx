"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";
import { Upload, Camera, MapPin, Loader2, X, ImageIcon } from "lucide-react";
import { setDonationState } from "@/lib/donation-store";

export default function DonatePage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!imagePreview || !address.trim()) return;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/vision", { method: "POST" });
      const data = await res.json();

      setDonationState({
        imagePreview,
        items: data.items,
        location: {
          address: address.trim(),
          lat: 37.7849,
          lng: -122.4094,
          pickupInstructions: pickupInstructions.trim() || undefined,
        },
        pickupInstructions: pickupInstructions.trim(),
      });

      router.push("/donate/review");
    } catch {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BlurFade delay={0.1}>
        <h1 className="text-3xl font-bold">Start a Donation</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a photo of your items and tell us where to pick them up.
        </p>
      </BlurFade>

      <div className="mt-8 space-y-6">
        {/* Photo Upload */}
        <BlurFade delay={0.2}>
          <label className="text-sm font-medium">Photo of Items</label>
          <div className="mt-2">
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-border hover:border-emerald-300 hover:bg-muted/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Drop your photo here</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse — mobile camera works too
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                    <Camera className="h-3 w-3" /> Camera
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                    <ImageIcon className="h-3 w-3" /> Gallery
                  </span>
                </div>
              </div>
            ) : (
              <Card className="relative overflow-hidden">
                <BorderBeam size={200} duration={8} colorFrom="#10b981" colorTo="#059669" />
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-64 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </Card>
            )}
          </div>
        </BlurFade>

        {/* Location */}
        <BlurFade delay={0.3}>
          <label className="text-sm font-medium">Pickup Address</label>
          <div className="relative mt-2">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter your address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10"
            />
          </div>
        </BlurFade>

        {/* Pickup Instructions */}
        <BlurFade delay={0.35}>
          <label className="text-sm font-medium">
            Pickup Instructions <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="e.g., Ring buzzer #3, items are in the lobby..."
            value={pickupInstructions}
            onChange={(e) => setPickupInstructions(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </BlurFade>

        {/* Submit */}
        <BlurFade delay={0.4}>
          <Button
            onClick={handleAnalyze}
            disabled={!imagePreview || !address.trim() || analyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing photo...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Analyze Photo
              </>
            )}
          </Button>
        </BlurFade>
      </div>
    </div>
  );
}
