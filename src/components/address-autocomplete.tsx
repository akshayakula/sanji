"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { isGoogleMapsConfigured } from "@/lib/google-maps";
import { Input } from "@/components/ui/input";

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter your address...",
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const configured = isGoogleMapsConfigured();

  const initAutocomplete = useCallback(() => {
    if (!configured || !inputRef.current || autocompleteRef.current) return;
    if (!window.google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address", "geometry", "place_id"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const result: PlaceResult = {
        address: place.formatted_address || "",
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || "",
      };

      onChange(result.address);
      onPlaceSelect(result);
    });

    autocompleteRef.current = autocomplete;
  }, [configured, onChange, onPlaceSelect]);

  useEffect(() => {
    if (!configured) return;

    // Google Maps API may load async — poll briefly
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    setIsLoading(true);
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(interval);
        setIsLoading(false);
        initAutocomplete();
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [configured, initAutocomplete]);

  // Fallback: plain input when Google Maps is not configured
  if (!configured) {
    return (
      <div className={`relative ${className || ""}`}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 h-11 rounded-xl border-gray-200 focus:border-teal-400 focus:ring-teal-400"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10" />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 animate-spin z-10" />
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent pl-10 pr-4 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
