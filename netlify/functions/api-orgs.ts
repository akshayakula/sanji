import type { Handler } from "@netlify/functions";
import type { Organization } from "../../src/types";
import { foodReliefPartners, getPartnerCoords } from "../../src/data/foodReliefPartners";
import { jsonResponse, parseBody } from "./utils";

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

function partnerTypeToOrgType(
  type: "regional_food_bank" | "meal_production_nonprofit" | "food_pantry" | "meal_service" | "community_micro_pantry"
): "shelter" | "kitchen" | "fridge" | "foodbank" {
  switch (type) {
    case "regional_food_bank":
    case "food_pantry":
    case "community_micro_pantry":
      return "foodbank";
    case "meal_production_nonprofit":
    case "meal_service":
      return "kitchen";
    default:
      return "foodbank";
  }
}

function mapPartnerToOrganization(
  partner: (typeof foodReliefPartners)[0],
  donorLat: number,
  donorLng: number
): Organization {
  const coords = getPartnerCoords(partner.id);
  const addressStr = partner.address
    ? `${partner.address.street}, ${partner.address.city}, ${partner.address.state} ${partner.address.zip}`
    : "Contact for address";
  const phone = partner.contact.phone.replace(/[\s()\-]/g, "");
  const operatingHours = partner.hours?.mon_fri ? `Mon-Fri ${partner.hours.mon_fri}` : "Call for hours";
  return {
    id: partner.id,
    name: partner.name,
    type: partnerTypeToOrgType(partner.type),
    address: addressStr,
    lat: coords.lat,
    lng: coords.lng,
    phone,
    distance: haversineDistance(donorLat, donorLng, coords.lat, coords.lng),
    acceptsCategories: ["food", "beverage", "supply", ...partner.pickup_capabilities.preferred_items],
    operatingHours,
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  const body = parseBody<{ lat?: number; lng?: number }>(event.body);
  const lat = body?.lat;
  const lng = body?.lng;
  if (lat == null || lng == null) {
    return jsonResponse({ error: "lat and lng required" }, 400);
  }
  const organizations: Organization[] = foodReliefPartners
    .map((partner) => mapPartnerToOrganization(partner, lat, lng))
    .sort((a, b) => a.distance - b.distance);
  return jsonResponse({ organizations });
};
