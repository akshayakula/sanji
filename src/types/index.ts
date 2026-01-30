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
  pickupInstructions?: string;
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

export type CallStatus = "pending" | "calling" | "no_answer" | "declined" | "accepted";

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
