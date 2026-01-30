import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// 20 miles in meters
const SEARCH_RADIUS = 32187;

// Calculate distance between two lat/lng points in miles
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function inferOrgType(types: string[]): "shelter" | "kitchen" | "fridge" | "foodbank" {
  const joined = types.join(" ").toLowerCase();
  if (joined.includes("food_bank") || joined.includes("food bank")) return "foodbank";
  if (joined.includes("meal") || joined.includes("kitchen") || joined.includes("restaurant")) return "kitchen";
  if (joined.includes("fridge")) return "fridge";
  return "shelter";
}

interface PlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  types: string[];
  distance: number;
}

async function searchPlaces(
  query: string,
  lat: number,
  lng: number
): Promise<PlaceResult[]> {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.types",
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: SEARCH_RADIUS,
        },
      },
      pageSize: 10,
    }),
  });

  const data = await response.json();

  if (!data.places) return [];

  return data.places.map((p: {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    internationalPhoneNumber?: string;
    types?: string[];
  }) => ({
    id: p.id,
    name: p.displayName?.text || "Unknown",
    address: p.formattedAddress || "",
    lat: p.location?.latitude || 0,
    lng: p.location?.longitude || 0,
    phone: p.internationalPhoneNumber || "",
    types: p.types || [],
    distance: haversineDistance(
      lat, lng,
      p.location?.latitude || 0,
      p.location?.longitude || 0
    ),
  }));
}

export async function POST(req: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: "Google Maps not configured" }, { status: 500 });
  }

  let lat: number, lng: number;
  try {
    const body = await req.json();
    lat = body.lat;
    lng = body.lng;
    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Search with a broad query to capture shelters, food banks, kitchens, pantries
    const results = await searchPlaces(
      "homeless shelter OR food bank OR soup kitchen OR food pantry",
      lat,
      lng
    );

    if (results.length === 0) {
      return NextResponse.json({ organizations: [] });
    }

    // Deduplicate by place ID, sort by distance, take closest 5
    const seen = new Set<string>();
    const unique = results.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    const closest = unique
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    // Map to our Organization shape
    const organizations = closest.map((place) => ({
      id: place.id,
      name: place.name,
      type: inferOrgType(place.types),
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      // Normalize phone: remove spaces, parens, dashes for VAPI E.164 format
      phone: place.phone.replace(/[\s()\-]/g, ""),
      distance: place.distance,
      acceptsCategories: ["food", "beverage", "supply"],
      operatingHours: "Call for hours",
    }));

    return NextResponse.json({ organizations });
  } catch (err) {
    console.error("Orgs search error:", err);
    return NextResponse.json({ error: "Failed to search organizations" }, { status: 500 });
  }
}
