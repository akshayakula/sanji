"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  Upload, Camera, MapPin, Loader2, X, ImageIcon, Sparkles, Package, ArrowRight,
} from "lucide-react";
import { setDonationState } from "@/lib/donation-store";
import { DonationItem, DonorLocation } from "@/types";
import { AddressAutocomplete, PlaceResult } from "@/components/address-autocomplete";
import { MapView, FallbackMap } from "@/components/map-view";

export default function DonatePage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [items, setItems] = useState<DonationItem[]>([]);
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
    if (!imagePreview) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/vision", { method: "POST" });
      const data = await res.json();
      setItems(data.items);
      setAnalyzed(true);
    } catch {
      alert("Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateItemQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    setAddress(place.address);
  };

  const handleSubmit = () => {
    if (!items.length || !address.trim()) return;
    const location: DonorLocation = {
      address: address.trim(),
      lat: selectedPlace?.lat ?? 37.7849,
      lng: selectedPlace?.lng ?? -122.4094,
      placeId: selectedPlace?.placeId,
    };
    setDonationState({
      imagePreview,
      items,
      location,
    });
    router.push("/donate/review");
  };

  const categoryIcons: Record<string, string> = {
    food: "\U0001F37D\uFE0F",
    beverage: "\U0001F964",
    supply: "\U0001F4E6",
    other: "\U0001F4CB",
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-16">
      {/* Header */}
      <BlurFade delay={0.05}>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Start a Donation
        </h1>
        <p className="mt-2 text-gray-500">
          Snap a photo of extra food or supplies.
        </p>
      </BlurFade>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* LEFT COLUMN: Upload + Items */}
        <div className="space-y-5">
          {/* Photo Upload / Preview */}
          <BlurFade delay={0.1}>
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  dragActive
                    ? "border-teal-500 bg-teal-50/50 scale-[1.01]"
                    : "border-gray-200 hover:border-teal-300 hover:bg-gray-50/50"
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 mb-4">
                  <Upload className="h-6 w-6 text-teal-600" />
                </div>
                <p className="font-semibold text-gray-900">Drag & Drop, upload from the gallery</p>
                <p className="mt-1 text-sm text-gray-400">or use your camera</p>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                    <Camera className="h-3 w-3" /> Camera
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
                    <ImageIcon className="h-3 w-3" /> Gallery
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-card-hover border border-gray-100">
                <BorderBeam size={250} duration={8} colorFrom="#0D9488" colorTo="#14B8A6" />
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-[280px] w-full object-cover"
                />
                <button
                  onClick={() => { setImagePreview(null); setAnalyzed(false); setItems([]); }}
                  className="absolute right-3 top-3 rounded-full bg-black/40 backdrop-blur-sm p-2 text-white hover:bg-black/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                {!analyzed && (
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full rounded-xl gradient-teal border-0 text-white h-11 font-semibold shadow-teal hover:opacity-90 transition-all"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze Photo
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </BlurFade>

          {/* Detected Items */}
          <AnimatePresence>
            {analyzed && items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                  <Package className="h-4 w-4" />
                  Detected Items
                </div>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-3.5 shadow-sm hover:shadow-card-hover transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-base shrink-0">
                      {categoryIcons[item.category] || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-14 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm font-semibold text-gray-900 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Location + Submit */}
        <div className="space-y-5">
          <BlurFade delay={0.15}>
            <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-900">Location</label>
                <p className="text-xs text-gray-400 mt-0.5">Where should the courier pick up?</p>
                <div className="mt-3">
                  <AddressAutocomplete
                    value={address}
                    onChange={setAddress}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search for an address..."
                  />
                </div>
              </div>

              {/* Map */}
              {selectedPlace ? (
                <MapView
                  lat={selectedPlace.lat}
                  lng={selectedPlace.lng}
                  zoom={16}
                  className="h-48"
                />
              ) : (
                <FallbackMap address={address || undefined} className="h-48" />
              )}

              {/* Distance badge */}
              {address && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1">
                    <MapPin className="h-3 w-3 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700">~ 30 m accuracy</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700">Available</span>
                  </div>
                </motion.div>
              )}
            </div>
          </BlurFade>

          {/* Submit */}
          <BlurFade delay={0.2}>
            <button
              onClick={handleSubmit}
              disabled={!analyzed || !items.length || !address.trim()}
              className="w-full h-13 rounded-2xl gradient-teal text-white font-semibold text-base shadow-teal disabled:opacity-40 disabled:shadow-none hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Continue to Review
              <ArrowRight className="h-4 w-4" />
            </button>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
