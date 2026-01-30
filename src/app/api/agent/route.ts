import { NextRequest, NextResponse } from "next/server";

const VAPI_API_KEY = process.env.VAPI_API_KEY || "";
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "";

export async function POST(req: NextRequest) {
  if (!VAPI_API_KEY || !VAPI_ASSISTANT_ID) {
    return NextResponse.json(
      { error: "VAPI not configured" },
      { status: 500 }
    );
  }

  let phoneNumber: string;
  let orgName: string;
  let itemsSummary: string;
  let phoneNumberId: string | undefined;

  try {
    const body = await req.json();
    phoneNumber = body.phoneNumber;
    orgName = body.orgName;
    itemsSummary = body.itemsSummary;
    phoneNumberId = body.phoneNumberId;

    if (!phoneNumber || !orgName || !itemsSummary) {
      return NextResponse.json(
        { error: "Missing phoneNumber, orgName, or itemsSummary" },
        { status: 400 }
      );
    }

    // Skip orgs without phone numbers
    if (!phoneNumber || phoneNumber.length < 8) {
      return NextResponse.json(
        { error: "No valid phone number for this organization" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const systemPrompt = `You are a friendly, professional phone caller from Dashwill — a food donation logistics platform that connects surplus food donors with shelters, food banks, and community kitchens.

You are calling ${orgName} to offer a food donation.

## AVAILABLE DONATION
${itemsSummary}

## YOUR CONVERSATION FLOW
1. **Greeting** (brief, warm): "Hi there! My name is Dash, and I'm calling from Dashwill — we're a food donation service."
2. **The offer**: "We have a donor nearby who has ${itemsSummary} available to donate today. Would your organization be able to accept this donation?"
3. **If they say YES**:
   - Say: "That's wonderful, thank you so much!"
   - Explain delivery: "We can arrange delivery through our courier service — a driver will pick up the food from the donor and bring it directly to you, usually within the hour. There's no cost to your organization."
   - Ask: "Is there anything specific the driver should know — like a back entrance, loading dock, or someone to ask for?"
   - Confirm and thank them warmly.
4. **If they say NO or can't accept today**:
   - Say: "No worries at all, I completely understand. Thank you for your time, and we'll keep you in mind for future donations."
   - End politely.
5. **If voicemail**: "Hi, this is Dash from Dashwill. We have a food donation available — ${itemsSummary}. If you're interested, we can have it delivered at no cost. You can reach us through our platform. Thanks and have a great day!"

## RULES
- Keep it conversational and natural — like a friendly human, not a robot
- Never be pushy. One ask is enough.
- Keep the call under 90 seconds
- If they ask how Dashwill works, briefly explain: "Donors snap a photo of extra food, our AI identifies the items, and we automatically find nearby organizations that can use them. Then we dispatch a courier to handle the delivery."
- If they ask about cost: "There's no cost to your organization — the delivery is free."
- If they have questions you can't answer, say: "I don't have that information right now, but I can have our team follow up with you."
- Always end with a warm goodbye`;

  const firstMessage = `Hi there! My name is Dash and I'm calling from Dashwill, a food donation service. We have a donor nearby with ${itemsSummary} available to donate today. Would your organization be able to accept this donation?`;

  try {
    const callBody: Record<string, unknown> = {
      assistantId: VAPI_ASSISTANT_ID,
      assistantOverrides: {
        firstMessage,
        // Voice settings for natural conversation
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM", // "Rachel" — warm, professional female voice
          stability: 0.6,
          similarityBoost: 0.8,
          speed: 1.05, // slightly faster for natural pacing
        },
        model: {
          provider: "openai",
          model: "gpt-4o-mini", // faster responses, lower latency
          temperature: 0.7, // natural conversational variation
          maxTokens: 200, // keep responses concise
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
        },
        // Silence and timing settings for low latency
        silenceTimeoutSeconds: 20, // hang up after 20s silence
        maxDurationSeconds: 120, // max 2 min call
        backgroundSound: "off",
        // Analysis plan for structured outcome extraction
        analysisPlan: {
          structuredDataPrompt: `Analyze the call transcript and determine:
1. outcome: Did the organization accept ("accepted"), decline ("declined"), or did it go to voicemail ("voicemail")?
2. message: What did they say? Include any delivery instructions they mentioned.

If the person said yes, agreed, or indicated they can accept → "accepted"
If they said no, can't accept, full, closed → "declined"
If it was a recorded message or voicemail → "voicemail"`,
          structuredDataSchema: {
            type: "object",
            properties: {
              outcome: {
                type: "string",
                enum: ["accepted", "declined", "voicemail"],
              },
              message: {
                type: "string",
                description: "Summary of org response including any delivery instructions",
              },
            },
            required: ["outcome"],
          },
          successEvaluationPrompt: "Did the organization agree to accept the food donation? Answer 'true' if yes, 'false' if no or voicemail.",
        },
        // Transcription settings
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
      },
      customer: {
        number: phoneNumber,
      },
    };

    if (phoneNumberId) {
      callBody.phoneNumberId = phoneNumberId;
    }

    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(callBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("VAPI create call error:", response.status, JSON.stringify(data));
      return NextResponse.json(
        { error: "Failed to create call", details: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      callId: data.id,
      status: data.status || "queued",
    });
  } catch (err) {
    console.error("VAPI call error:", err);
    return NextResponse.json(
      { error: "Failed to initiate call" },
      { status: 500 }
    );
  }
}
