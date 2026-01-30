"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";
import { isGoogleMapsConfigured } from "@/lib/google-maps";
import { MapPin } from "lucide-react";

interface MapViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  markers?: { lat: number; lng: number; label?: string }[];
}

function FallbackMap({ address, className }: { address?: string; className?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br from-teal-50 via-white to-teal-50/30 border border-teal-100/50 relative overflow-hidden ${className || "h-52"}`}>
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-6 left-8 h-1.5 w-20 bg-teal-200 rounded" />
        <div className="absolute top-10 left-4 h-1 w-28 bg-teal-100 rounded" />
        <div className="absolute top-16 left-10 h-1 w-16 bg-teal-200 rounded" />
        <div className="absolute bottom-10 right-6 h-1.5 w-24 bg-teal-100 rounded" />
        <div className="absolute bottom-16 right-10 h-1 w-16 bg-teal-200 rounded" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="h-8 w-8 rounded-full bg-teal-500 border-[3px] border-white shadow-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-teal-400 animate-pulse-ring" />
        </div>
      </div>
      {address && (
        <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-teal-500 shrink-0" />
            <span className="text-xs text-gray-600 truncate">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MapView({ lat, lng, zoom = 15, className, markers = [] }: MapViewProps) {
  if (!isGoogleMapsConfigured()) {
    return <FallbackMap className={className} />;
  }

  const allMarkers = [{ lat, lng }, ...markers];

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-100 shadow-sm ${className || "h-52"}`}>
      <Map
        center={{ lat, lng }}
        zoom={zoom}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        zoomControl={true}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        {allMarkers.map((marker, i) => (
          <Marker
            key={i}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        ))}
      </Map>
    </div>
  );
}

export { FallbackMap };
