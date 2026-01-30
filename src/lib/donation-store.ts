"use client";

import { DonationItem, DonorLocation, Organization } from "@/types";

// Simple in-memory store for the donation flow (no state management library needed)
let donationState = {
  imagePreview: null as string | null,
  items: [] as DonationItem[],
  location: null as DonorLocation | null,
  pickupInstructions: "",
  matchedOrg: null as Organization | null,
  deliveryId: null as string | null,
};

export function getDonationState() {
  return donationState;
}

export function setDonationState(updates: Partial<typeof donationState>) {
  donationState = { ...donationState, ...updates };
}

export function resetDonationState() {
  donationState = {
    imagePreview: null,
    items: [],
    location: null,
    pickupInstructions: "",
    matchedOrg: null,
    deliveryId: null,
  };
}
