import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { to, subject, text, fromName, fromEmail, bcc, apiKey } = body;

  if (!apiKey) {
    return NextResponse.json({ error: "No Resend API key configured. Add it in Settings → Email." }, { status: 400 });
  }
  if (!to || !subject || !text) {
    return NextResponse.json({ error: "Missing required fields: to, subject, text" }, { status: 400 });
  }

  const from = fromName && fromEmail
    ? `${fromName} <${fromEmail}>`
    : fromEmail ?? "Pacific Island Partners <outreach@islandsothebys.com>";

  const payload: Record<string, unknown> = { from, to: [to], subject, text };
  if (bcc && fromEmail) payload.bcc = [fromEmail];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? "Failed to send email" }, { status: res.status });
  }

  return NextResponse.json({ id: data.id, status: "sent" });
}
