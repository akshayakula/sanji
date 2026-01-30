export interface DonationItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: "food" | "beverage" | "supply" | "other";
}

export interface DonorLocation {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  pickupInstructions?: string;
}

export interface FoodReliefPartner {
  id: string;
  name: string;
  type: "regional_food_bank" | "meal_production_nonprofit" | "food_pantry" | "meal_service" | "community_micro_pantry";
  contact: { phone: string; email: string };
  address?: { street: string; city: string; state: string; zip: string };
  pickup_capabilities: {
    accepts_same_day_surplus: boolean;
    max_weight_lbs: number;
    preferred_items: string[];
  };
  hours?: { mon_fri?: string };
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "shelter" | "kitchen" | "fridge" | "foodbank";
  address: string;
  lat: number;
  lng: number;
  phone: string;
  distance: number;
  acceptsCategories: string[];
  operatingHours: string;
}

export type CallStatus = "pending" | "calling" | "dialing" | "ringing" | "talking" | "analyzing" | "no_answer" | "declined" | "accepted";

export interface OrgCallResult {
  orgId: string;
  org: Organization;
  status: CallStatus;
  message?: string;
}

export interface Delivery {
  id: string;
  status: "dispatching" | "driver_assigned" | "pickup" | "in_transit" | "delivered";
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  pickupAddress: string;
  dropoffAddress: string;
  items: DonationItem[];
  orgName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationFlow {
  imageFile?: File;
  imagePreview?: string;
  items: DonationItem[];
  location: DonorLocation | null;
  matchedOrg?: Organization;
  deliveryId?: string;
}
