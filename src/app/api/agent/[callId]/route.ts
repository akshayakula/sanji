import { NextRequest, NextResponse } from "next/server";

const VAPI_API_KEY = process.env.VAPI_API_KEY || "";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  const { callId } = await params;

  if (!VAPI_API_KEY) {
    return NextResponse.json({ error: "VAPI not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("VAPI get call error:", response.status, err);
      return NextResponse.json({ error: "Failed to get call" }, { status: 502 });
    }

    const data = await response.json();

    // Map VAPI call status to our app status
    // VAPI statuses: queued, ringing, in-progress, forwarding, ended
    const vapiStatus = data.status;
    const endedReason = data.endedReason; // e.g. "customer-did-not-answer", "assistant-ended-call", etc.
    const analysis = data.analysis;

    let appStatus: string;
    let message: string | undefined;

    if (vapiStatus === "ended") {
      // Call ended — check analysis for outcome
      if (analysis?.structuredData?.outcome === "accepted") {
        appStatus = "accepted";
        message = analysis.structuredData.message || "Organization accepted the donation.";
      } else if (analysis?.structuredData?.outcome === "declined") {
        appStatus = "declined";
        message = analysis.structuredData.message || "Organization declined.";
      } else if (
        endedReason === "customer-did-not-answer" ||
        endedReason === "customer-busy" ||
        endedReason === "voicemail"
      ) {
        appStatus = "no_answer";
        message = "No answer";
      } else if (analysis?.structuredData?.outcome === "voicemail") {
        appStatus = "no_answer";
        message = "Reached voicemail";
      } else {
        // Call ended but no clear outcome from analysis yet —
        // analysis might still be processing
        if (!analysis) {
          appStatus = "processing";
          message = "Call ended, analyzing result...";
        } else {
          // Default: treat as no answer / inconclusive
          appStatus = "no_answer";
          message = analysis?.summary || "Could not determine outcome";
        }
      }
    } else if (vapiStatus === "in-progress" || vapiStatus === "forwarding") {
      appStatus = "calling";
      message = "Call in progress...";
    } else {
      // queued, ringing
      appStatus = "calling";
      message = "Ringing...";
    }

    return NextResponse.json({
      callId,
      vapiStatus,
      status: appStatus,
      message,
      endedReason,
    });
  } catch (err) {
    console.error("VAPI poll error:", err);
    return NextResponse.json({ error: "Failed to poll call" }, { status: 500 });
  }
}
