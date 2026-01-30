import type { Handler } from "@netlify/functions";
import { jsonResponse } from "./utils";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  await new Promise((r) => setTimeout(r, 1000));
  return jsonResponse({
    id: "del-" + Math.random().toString(36).substring(2, 8),
    status: "dispatching",
    estimatedArrival: "25 minutes",
    createdAt: new Date().toISOString(),
  });
};
