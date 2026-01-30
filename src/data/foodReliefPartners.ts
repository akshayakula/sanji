import type { FoodReliefPartner } from "../types";

// Approximate lat/lng for distance calculation (DC area)
const PARTNER_COORDS: Record<string, { lat: number; lng: number }> = {
  fb_capital_area_001: { lat: 38.9339, lng: -76.9467 },
  fb_dc_central_002: { lat: 38.8977, lng: -77.0227 },
  fb_bread_city_003: { lat: 38.8612, lng: -76.9953 },
  fb_miriams_004: { lat: 38.9085, lng: -77.0127 },
  fb_little_yellow_pantry_005: { lat: 38.8708, lng: -77.0882 },
};

export const foodReliefPartners: FoodReliefPartner[] = [
  {
    id: "fb_capital_area_001",
    name: "Capital Area Food Bank",
    type: "regional_food_bank",
    contact: {
      phone: "+1-202-644-9800",
      email: "donations@cafb-demo.org",
    },
    address: {
      street: "4900 Puerto Rico Ave NE",
      city: "Washington",
      state: "DC",
      zip: "20017",
    },
    pickup_capabilities: {
      accepts_same_day_surplus: true,
      max_weight_lbs: 500,
      preferred_items: ["produce", "prepared_food", "shelf_stable"],
    },
    hours: {
      mon_fri: "09:00-17:00",
    },
  },
  {
    id: "fb_dc_central_002",
    name: "DC Central Kitchen",
    type: "meal_production_nonprofit",
    contact: {
      phone: "+1-202-234-0707",
      email: "logistics@dcck-demo.org",
    },
    pickup_capabilities: {
      accepts_same_day_surplus: true,
      max_weight_lbs: 200,
      preferred_items: ["prepared_food", "protein", "produce"],
    },
  },
  {
    id: "fb_bread_city_003",
    name: "Bread For The City",
    type: "food_pantry",
    contact: {
      phone: "+1-202-265-2400",
      email: "foodprogram@bftc-demo.org",
    },
    pickup_capabilities: {
      accepts_same_day_surplus: true,
      max_weight_lbs: 100,
      preferred_items: ["shelf_stable", "produce", "bakery"],
    },
  },
  {
    id: "fb_miriams_004",
    name: "Miriam's Kitchen",
    type: "meal_service",
    contact: {
      phone: "+1-202-452-8926",
      email: "mealdonations@miriams-demo.org",
    },
    pickup_capabilities: {
      accepts_same_day_surplus: true,
      max_weight_lbs: 75,
      preferred_items: ["prepared_food", "bakery"],
    },
  },
  {
    id: "fb_little_yellow_pantry_005",
    name: "Little Yellow Pantry",
    type: "community_micro_pantry",
    contact: {
      phone: "+1-571-386-9946",
      email: "support@littleyellowpantry-demo.org",
    },
    pickup_capabilities: {
      accepts_same_day_surplus: true,
      max_weight_lbs: 30,
      preferred_items: ["shelf_stable", "bakery", "prepared_food_small_batch"],
    },
    notes: "Community mutual-aid style pantry. Fast drop-off / small batch friendly.",
  },
];

export function getPartnerCoords(partnerId: string): { lat: number; lng: number } {
  return PARTNER_COORDS[partnerId] ?? { lat: 38.9, lng: -77.0 };
}
