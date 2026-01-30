"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <>{children}</>;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      {children}
    </APIProvider>
  );
}

export function isGoogleMapsConfigured(): boolean {
  return !!GOOGLE_MAPS_API_KEY;
}

export { GOOGLE_MAPS_API_KEY };
