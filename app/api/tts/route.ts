import { NextRequest, NextResponse } from "next/server";
import { generateSpeech } from "@/lib/replicate-tts";

const MAX_TEXT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `text must be under ${MAX_TEXT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${req.headers.get("x-forwarded-proto") ?? "http"}://${req.headers.get("host")}`;

  const referenceAudioUrl = `${baseUrl}/voice-reference.wav`;

  try {
    const audioUrl = await generateSpeech(text.trim(), referenceAudioUrl);
    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("[/api/tts]", err);
    return NextResponse.json({ error: "TTS unavailable" }, { status: 502 });
  }
}
