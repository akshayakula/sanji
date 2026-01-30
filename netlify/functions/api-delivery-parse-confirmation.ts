import type { Handler } from "@netlify/functions";
import { jsonResponse, parseBody } from "./utils";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SYSTEM_PROMPT = `You are parsing an Uber order/delivery confirmation page (HTML). Extract the key details into a short, user-friendly summary. Return ONLY valid JSON with this shape (use null for missing fields):
{
  "pickup": "pickup address or location",
  "dropoff": "dropoff address or location",
  "eta": "estimated time or dropoff time",
  "price": "total price or fare if shown",
  "status": "order status if shown (e.g. Confirmed, On the way)",
  "summary": "1-2 sentence plain-language summary for the user (e.g. 'Your Uber delivery is confirmed. Pickup at X, dropoff at Y. Estimated dropoff 2:17 PM.')"
}
Strip HTML tags and keep values concise. If the page is not an Uber confirmation, set summary to a brief message saying so.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  if (!OPENAI_API_KEY) {
    return jsonResponse({ error: "OPENAI_API_KEY not configured" }, 500);
  }
  const body = parseBody<{ html?: string }>(event.body);
  const html = body?.html;
  if (typeof html !== "string" || !html.trim()) {
    return jsonResponse({ error: "Missing or empty html in body" }, 400);
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Parse this page content (strip script/style, use visible text):\n\n${html.slice(0, 50000)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (!res.ok) {
      return jsonResponse(
        { error: data?.error?.message || "OpenAI request failed" },
        res.status
      );
    }
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) {
      return jsonResponse({ error: "No content in OpenAI response" }, 502);
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return jsonResponse(parsed);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Parse failed" },
      500
    );
  }
};
