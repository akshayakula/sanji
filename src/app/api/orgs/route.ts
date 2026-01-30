import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Calculate distance between two lat/lng points in miles
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
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

// Determine org type from Google Places types
function inferOrgType(types: string[]): "shelter" | "kitchen" | "fridge" | "foodbank" {
  if (types.some((t) => t.includes("food_bank") || t.includes("food bank"))) return "foodbank";
  if (types.some((t) => t.includes("meal") || t.includes("kitchen") || t.includes("restaurant"))) return "kitchen";
  if (types.some((t) => t.includes("shelter") || t.includes("homeless") || t.includes("social_services"))) return "shelter";
  return "shelter"; // default
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
    // Use Google Places Text Search to find nearby shelters, food banks, kitchens
    const searchQueries = [
      "homeless shelter",
      "food bank",
      "community kitchen",
      "soup kitchen",
    ];

    const allPlaces: Map<string, {
      id: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      phone: string;
      types: string[];
      distance: number;
    }> = new Map();

    // Search each query type
    for (const query of searchQueries) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=8000&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.results) {
        for (const place of data.results) {
          if (allPlaces.has(place.place_id)) continue;

          const placeLat = place.geometry?.location?.lat;
          const placeLng = place.geometry?.location?.lng;
          if (!placeLat || !placeLng) continue;

          allPlaces.set(place.place_id, {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address || "",
            lat: placeLat,
            lng: placeLng,
            phone: "", // Text Search doesn't return phone; we'll get it from Place Details
            types: place.types || [],
            distance: haversineDistance(lat, lng, placeLat, placeLng),
          });
        }
      }
    }

    // Sort by distance, take closest 5
    const sorted = Array.from(allPlaces.values())
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    // Fetch phone numbers for the top 5 via Place Details
    const orgsWithPhone = await Promise.all(
      sorted.map(async (place) => {
        let phone = "";
        try {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.id}&fields=formatted_phone_number,international_phone_number,opening_hours&key=${GOOGLE_MAPS_API_KEY}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          phone = detailData.result?.international_phone_number || detailData.result?.formatted_phone_number || "";
          const hours = detailData.result?.opening_hours?.weekday_text;
          return {
            id: place.id,
            name: place.name,
            type: inferOrgType(place.types),
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            phone: phone.replace(/[\s()-]/g, ""), // normalize to digits/+
            distance: place.distance,
            acceptsCategories: ["food", "beverage", "supply"],
            operatingHours: hours ? hours[0] : "Call for hours",
          };
        } catch {
          return {
            id: place.id,
            name: place.name,
            type: inferOrgType(place.types),
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            phone,
            distance: place.distance,
            acceptsCategories: ["food", "beverage", "supply"],
            operatingHours: "Call for hours",
          };
        }
      })
    );

    return NextResponse.json({ organizations: orgsWithPhone });
  } catch (err) {
    console.error("Orgs search error:", err);
    return NextResponse.json({ error: "Failed to search organizations" }, { status: 500 });
  }
}
