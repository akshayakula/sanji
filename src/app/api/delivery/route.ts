import { NextResponse } from "next/server";

export async function POST() {
  await new Promise((r) => setTimeout(r, 1000));

  return NextResponse.json({
    id: "del-" + Math.random().toString(36).substring(2, 8),
    status: "dispatching",
    estimatedArrival: "25 minutes",
    createdAt: new Date().toISOString(),
  });
}
