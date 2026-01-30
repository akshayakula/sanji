import type { Handler } from "@netlify/functions";
import { jsonResponse } from "./utils";

function getIdFromPath(path: string): string | null {
  // Path may be /api/delivery/:id or /.netlify/functions/api-delivery-id/:id
  const match = path.match(/(?:\/api\/delivery\/|api-delivery-id\/)([^/]+)/);
  return match ? match[1] : null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  const id = getIdFromPath(event.path) || event.path.split("/").pop() || "unknown";
  return jsonResponse({
    id,
    status: "in_transit",
    driverName: "Marcus T.",
    driverPhone: "+1 (202) 555-9999",
    estimatedArrival: "12 minutes",
    pickupAddress: "1600 Pennsylvania Ave NW, Washington, DC",
    dropoffAddress: "801 E St NW, Washington, DC 20004",
    items: [
      { id: "item-1", name: "Sandwiches (assorted)", quantity: 12, unit: "pieces", category: "food" },
      { id: "item-2", name: "Water Bottles", quantity: 6, unit: "bottles", category: "beverage" },
      { id: "item-3", name: "Granola Bars", quantity: 10, unit: "bars", category: "food" },
    ],
    orgName: "DC Central Kitchen",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date().toISOString(),
  });
};
