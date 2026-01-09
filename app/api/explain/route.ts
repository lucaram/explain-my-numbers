// src/app/api/explain/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // keep it server-side

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function clampInput(s: string) {
  // keep MVP safe: avoid massive uploads
  const max = 50_000; // ~50k chars
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { input?: string };
    const raw = (body?.input ?? "").trim();
    if (!raw) return NextResponse.json({ ok: false, error: "Please paste or upload some numbers." }, { status: 400 });

    const input = clampInput(raw);

    const system = `
You are "Explain My Numbers", a strict numeric interpreter.

RULES:
- Do NOT invent causes. If something cannot be inferred from the provided numbers, say so.
- Do NOT give financial advice. No recommendations like "you should invest".
- Prefer clarity over verbosity. Use plain English.
- If there is only a single data point or unclear units, explicitly state limitations.

OUTPUT FORMAT (use these exact headings, in this order):
Summary:
What changed:
Why it likely changed:
What it means:
What NOT to conclude:
Confidence: (Low/Medium/High) + one sentence why
`.trim();

    const prompt = `
USER DATA (may be CSV/table/text). Explain what the numbers are saying.

DATA:
${input}
`.trim();

const resp = await client.responses.create({
  model: "gpt-4.1-mini",
  input: [
    { role: "system", content: system },
    { role: "user", content: prompt },
  ],
});




    return NextResponse.json({ ok: true, explanation: resp.output_text });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
