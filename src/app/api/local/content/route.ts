import { NextResponse } from "next/server";

const NGROK_URL = (process.env.NGROK_URL || "").replace(/\/$/, "");

export async function GET() {
  if (!NGROK_URL) {
    return NextResponse.json(
      { error: "NGROK_URL not configured" },
      { status: 500 }
    );
  }
  try {
    const res = await fetch(`${NGROK_URL}/content`);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || "content fetch failed" },
        { status: res.status }
      );
    }
    const html = await res.text();
    return NextResponse.json({ html });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 502 }
    );
  }
}
