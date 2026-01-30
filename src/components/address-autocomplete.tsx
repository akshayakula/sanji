"use client";

import { useRef, useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, Search, Loader2 } from "lucide-react";
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

interface Suggestion {
  placeId: string;
  mainText: string;
  fullText: string;
}

function GoogleAutocomplete({
  value,
  onPlaceSelect,
  onChange,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const places = useMapsLibrary("places");
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Create session token on mount
  useEffect(() => {
    if (places) {
      sessionTokenRef.current = new places.AutocompleteSessionToken();
    }
  }, [places]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!places || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Use the NEW AutocompleteSuggestion API
      const request: google.maps.places.AutocompleteRequest = {
        input: query,
        sessionToken: sessionTokenRef.current!,
        includedPrimaryTypes: ["street_address", "subpremise", "premise"],
      };

      const { suggestions: results } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      const mapped: Suggestion[] = results
        .filter((s) => s.placePrediction)
        .map((s) => ({
          placeId: s.placePrediction!.placeId,
          mainText: s.placePrediction!.mainText?.text || "",
          fullText: s.placePrediction!.text?.text || "",
        }));

      setSuggestions(mapped);
      if (mapped.length > 0) setShowDropdown(true);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setShowDropdown(false);
    setInputValue(suggestion.fullText);
    onChange(suggestion.fullText);

    if (!places) return;

    try {
      // Use new Place class to get details
      const place = new places.Place({ id: suggestion.placeId });
      await place.fetchFields({ fields: ["location", "formattedAddress"] });

      if (place.location) {
        onPlaceSelect({
          address: place.formattedAddress || suggestion.fullText,
          lat: place.location.lat(),
          lng: place.location.lng(),
          placeId: suggestion.placeId,
        });
      }

      // Refresh session token after a selection
      sessionTokenRef.current = new places.AutocompleteSessionToken();
    } catch (err) {
      console.error("Place details error:", err);
      onPlaceSelect({
        address: suggestion.fullText,
        lat: 0,
        lng: 0,
        placeId: suggestion.placeId,
      });
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10 pointer-events-none" />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 animate-spin z-10 pointer-events-none" />
      ) : (
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 z-10 pointer-events-none" />
      )}
      <input
        type="text"
        placeholder={placeholder || "Search for an address..."}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        className="flex h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2 text-sm shadow-xs placeholder:text-gray-400 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus-visible:outline-none"
      />

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl bg-white border border-gray-200 shadow-elevated overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              onClick={() => handleSelect(s)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-teal-50 transition-colors ${
                i !== suggestions.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <MapPin className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {s.mainText}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {s.fullText}
                </p>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">Powered by Google</p>
          </div>
        </div>
      )}
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
  if (!isGoogleMapsConfigured()) {
    return <PlainInput {...props} />;
  }
  return <GoogleAutocomplete {...props} />;
}
