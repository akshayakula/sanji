import type { Handler } from "@netlify/functions";

const jsonHeaders = { "Content-Type": "application/json" };

export function jsonResponse(body: unknown, statusCode = 200): ReturnType<Handler> {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  };
}

export function parseBody<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
