import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "in_transit",
    driverName: "Marcus T.",
    driverPhone: "+1 (415) 555-9999",
    estimatedArrival: "12 minutes",
    pickupAddress: "350 Mission St, San Francisco, CA",
    dropoffAddress: "321 Ellis St, San Francisco, CA 94102",
    items: [
      { id: "item-1", name: "Sandwiches (assorted)", quantity: 12, unit: "pieces", category: "food" },
      { id: "item-2", name: "Water Bottles", quantity: 6, unit: "bottles", category: "beverage" },
      { id: "item-3", name: "Granola Bars", quantity: 10, unit: "bars", category: "food" },
    ],
    orgName: "Tenderloin Community Fridge",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
