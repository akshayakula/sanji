import { NextResponse } from "next/server";

const NGROK_URL = (process.env.NGROK_URL || "").replace(/\/$/, "");

export async function POST() {
  if (!NGROK_URL) {
    return NextResponse.json(
      { error: "NGROK_URL not configured" },
      { status: 500 }
    );
  }
  try {
    const res = await fetch(`${NGROK_URL}/confirm-delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data || { error: "confirm-delivery failed" }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 502 }
    );
  }
}
