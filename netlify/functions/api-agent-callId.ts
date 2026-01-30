import type { Handler } from "@netlify/functions";
import { jsonResponse } from "./utils";

const VAPI_API_KEY = process.env.VAPI_API_KEY || "";

function getCallIdFromPath(path: string): string | null {
  // Path may be /api/agent/:callId or /.netlify/functions/api-agent-callId/:callId
  const match = path.match(/(?:\/api\/agent\/|api-agent-callId\/)([^/]+)/);
  return match ? match[1] : null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  const callId = getCallIdFromPath(event.path) || event.path.split("/").pop() || "";
  if (!callId) {
    return jsonResponse({ error: "callId required" }, 400);
  }
  if (!VAPI_API_KEY) {
    return jsonResponse({ error: "VAPI not configured" }, 500);
  }
  try {
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });
    if (!response.ok) {
      const err = await response.text();
      console.error("VAPI get call error:", response.status, err);
      return jsonResponse({ error: "Failed to get call" }, 502);
    }
    const data = await response.json();
    const vapiStatus = data.status;
    const endedReason = data.endedReason;
    const analysis = data.analysis;

    let appStatus: string;
    let message: string | undefined;

    if (vapiStatus === "ended") {
      if (analysis?.structuredData?.outcome === "accepted") {
        appStatus = "accepted";
        message = analysis.structuredData.message || "Organization accepted the donation.";
      } else if (analysis?.structuredData?.outcome === "declined") {
        appStatus = "declined";
        message = analysis.structuredData.message || "Organization declined.";
      } else if (
        endedReason === "customer-did-not-answer" ||
        endedReason === "customer-busy"
      ) {
        appStatus = "no_answer";
        message = endedReason === "customer-busy" ? "Line busy" : "No answer";
      } else if (
        analysis?.structuredData?.outcome === "voicemail" ||
        endedReason === "voicemail"
      ) {
        appStatus = "no_answer";
        message = "Reached voicemail";
      } else if (!analysis) {
        appStatus = "analyzing";
        message = "Analyzing call result...";
      } else {
        appStatus = "no_answer";
        message = analysis?.summary || endedReason || "Could not determine outcome";
      }
    } else if (vapiStatus === "in-progress") {
      appStatus = "talking";
      message = "Talking to organization...";
    } else if (vapiStatus === "ringing") {
      appStatus = "ringing";
      message = "Ringing...";
    } else if (vapiStatus === "queued") {
      appStatus = "dialing";
      message = "Dialing...";
    } else if (vapiStatus === "forwarding") {
      appStatus = "ringing";
      message = "Connecting...";
    } else {
      appStatus = "calling";
      message = "Initiating call...";
    }

    return jsonResponse({
      callId,
      vapiStatus,
      status: appStatus,
      message,
      endedReason,
    });
  } catch (err) {
    console.error("VAPI poll error:", err);
    return jsonResponse({ error: "Failed to poll call" }, 500);
  }
};
