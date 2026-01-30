"use client";

import { useRef, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, Loader2, Search } from "lucide-react";
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

function GoogleAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const places = useMapsLibrary("places");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!places || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
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
    setReady(true);
  }, [places, onChange, onPlaceSelect]);

  return (
    <div className={`relative ${className || ""}`}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10 pointer-events-none" />
      {!ready && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 animate-spin z-10" />
      )}
      {ready && (
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 z-10 pointer-events-none" />
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        className="flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2 text-sm shadow-xs placeholder:text-gray-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function PlainInput({
  value,
  onChange,
  placeholder,
  className,
}: Omit<AddressAutocompleteProps, "onPlaceSelect">) {
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

export function AddressAutocomplete(props: AddressAutocompleteProps) {
  const configured = isGoogleMapsConfigured();

  if (!configured) {
    return <PlainInput {...props} />;
  }

  return <GoogleAutocomplete {...props} />;
}
