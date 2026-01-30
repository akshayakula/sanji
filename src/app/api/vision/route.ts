import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  let imageBase64: string;
  try {
    const body = await req.json();
    imageBase64 = body.image; // expects a data URL like "data:image/jpeg;base64,..."
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a food donation analyst. Analyze the photo and identify all donatable food items, beverages, and supplies visible.

For each item, provide:
- name: A clear, concise name (e.g. "Whole Wheat Bread Loaves", "Canned Tomato Soup")
- quantity: Your best estimate of how many are visible. Count carefully. If items are in a box/pack, count the visible packs, not individual items inside.
- unit: The appropriate unit (e.g. "loaves", "cans", "bottles", "bags", "boxes", "pieces", "bunches", "packs")
- category: One of "food", "beverage", "supply", or "other"

Respond ONLY with a valid JSON array. No markdown, no explanation, just the JSON array.
Example: [{"name":"Canned Tomato Soup","quantity":6,"unit":"cans","category":"food"}]

Be precise with quantities. If you see a 6-pack of water, that's quantity 1, unit "6-pack". If you see 6 individual bottles, that's quantity 6, unit "bottles". Count what you actually see.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify all donatable items in this photo with accurate quantities.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API error:", response.status, err);
      return NextResponse.json(
        { error: "Vision API failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "[]";

    // Parse the JSON from the response, stripping any markdown fences
    let cleaned = content;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    // Map to our DonationItem shape with generated IDs
    const items = Array.isArray(parsed)
      ? parsed.map((item: { name: string; quantity: number; unit: string; category: string }, i: number) => ({
          id: `item-${i + 1}`,
          name: item.name || "Unknown Item",
          quantity: item.quantity || 1,
          unit: item.unit || "pieces",
          category: ["food", "beverage", "supply", "other"].includes(item.category)
            ? item.category
            : "other",
        }))
      : [];

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Vision processing error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
