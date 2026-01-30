import type { Handler, HandlerResponse } from "@netlify/functions";
import { jsonResponse } from "./utils";

const NGROK_URL = (process.env.NGROK_URL || "").replace(/\/$/, "");

/** Path after /api/local/ — from redirect ?path=:splat or from event.path */
function getLocalPath(event: { path: string; queryStringParameters?: Record<string, string> | null }): string {
  const q = event.queryStringParameters?.path;
  if (q) return q;
  const match = event.path.match(/\/api\/local\/?(.*)/);
  return match ? match[1] : "";
}

export const handler: Handler = async (event) => {
  if (!NGROK_URL) {
    return jsonResponse({ error: "NGROK_URL not configured" }, 500);
  }
  const subpath = getLocalPath(event);
  if (!subpath) {
    return jsonResponse({ error: "Missing path after /api/local/" }, 400);
  }
  const url = `${NGROK_URL}/${subpath}`;
  const method = event.httpMethod;
  try {
    const res = await fetch(url, {
      method,
      headers:
        method !== "GET" && event.body
          ? { "Content-Type": "application/json" }
          : undefined,
      body: method !== "GET" && event.body ? event.body : undefined,
    });
    const contentType = res.headers.get("Content-Type") || "";
    const isJson = contentType.includes("application/json");
    const isHtml = contentType.includes("text/html");
    const isImage = contentType.includes("image/");
    const isBinary = isImage || contentType.includes("application/octet-stream");

    if (!res.ok) {
      const text = await res.text();
      return jsonResponse(
        { error: text || `Request failed: ${res.status}` },
        res.status
      );
    }

    // Keep frontend contract: /content returns JSON { html }
    if (subpath === "content" && isHtml) {
      const html = await res.text();
      return jsonResponse({ html });
    }

    if (isBinary) {
      const buf = await res.arrayBuffer();
      const base64 = Buffer.from(buf).toString("base64");
      const response: HandlerResponse = {
        statusCode: 200,
        headers: { "Content-Type": contentType.split(";")[0].trim() },
        body: base64,
        isBase64Encoded: true,
      };
      return response;
    }

    if (isJson) {
      const data = await res.json();
      return jsonResponse(data);
    }

    const text = await res.text();
    return {
      statusCode: 200,
      headers: { "Content-Type": contentType || "text/plain" },
      body: text,
    };
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Request failed" },
      502
    );
  }
};
