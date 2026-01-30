import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { orgId } = body;

  await new Promise((r) => setTimeout(r, 2000));

  // Simulate different outcomes per org
  const outcomes: Record<string, { status: string; message: string }> = {
    "org-1": { status: "no_answer", message: "No answer after 3 attempts" },
    "org-2": { status: "declined", message: "At full capacity today" },
    "org-3": { status: "accepted", message: "Can accept all items. Ask driver to place near the fridge." },
    "org-4": { status: "no_answer", message: "No answer after 3 attempts" },
    "org-5": { status: "accepted", message: "Happy to receive! Bring to back entrance." },
  };

  const result = outcomes[orgId] || { status: "no_answer", message: "Could not reach organization" };

  return NextResponse.json(result);
}
