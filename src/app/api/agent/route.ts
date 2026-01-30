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
    phoneNumber = body.phoneNumber; // E.164 format
    orgName = body.orgName;
    itemsSummary = body.itemsSummary; // e.g. "10 bagels, 6 cream cheese packets"
    phoneNumberId = body.phoneNumberId;

    if (!phoneNumber || !orgName || !itemsSummary) {
      return NextResponse.json(
        { error: "Missing phoneNumber, orgName, or itemsSummary" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const systemPrompt = `You are a polite and professional caller from Dashwill, a food donation logistics platform. You are calling ${orgName}.

Your goals:
1. Greet the person who answers: "Hi, I'm calling from Dashwill, a food donation service."
2. Explain: "We have a donor nearby with the following items available for donation: ${itemsSummary}."
3. Ask: "Would your organization be able to accept this donation today?"
4. If they say yes, confirm and thank them warmly. Ask if there are any special instructions for the delivery driver.
5. If they say no, thank them for their time and end politely.

Keep the call short and friendly — under 60 seconds. Do not be pushy. If you reach voicemail, leave a brief message explaining the donation and ask them to call back.`;

  const firstMessage = `Hi, this is Dashwill calling. We have a food donation available nearby — ${itemsSummary}. Is your organization able to accept a donation today?`;

  try {
    // Build the call request
    const callBody: Record<string, unknown> = {
      assistantId: VAPI_ASSISTANT_ID,
      assistantOverrides: {
        firstMessage,
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
          ],
        },
        analysisPlan: {
          structuredDataPrompt: `Based on the call transcript, determine if the organization accepted or declined the donation. Extract:
- outcome: "accepted", "declined", or "voicemail"
- message: A brief summary of what they said (e.g. "Happy to accept, bring to back door" or "At full capacity today")`,
          structuredDataSchema: {
            type: "object",
            properties: {
              outcome: {
                type: "string",
                enum: ["accepted", "declined", "voicemail"],
                description: "Whether the org accepted the donation",
              },
              message: {
                type: "string",
                description: "Brief summary of org response",
              },
            },
            required: ["outcome"],
          },
          successEvaluationPrompt: "Evaluate if the donation was accepted by the organization.",
        },
      },
      customer: {
        number: phoneNumber,
      },
    };

    // Add phoneNumberId if provided
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
      console.error("VAPI create call error:", response.status, data);
      return NextResponse.json(
        { error: "Failed to create call", details: data },
        { status: 502 }
      );
    }

    // Return the call ID so the client can poll for status
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
