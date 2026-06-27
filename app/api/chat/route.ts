import { NextRequest, NextResponse } from "next/server";
import { getDeepSeekClient, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { loadKnowledgeBase } from "@/lib/knowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: Message[];
}

const SYSTEM_PROMPT_PREFIX = `You are AI Keshav — an AI version of Sumant Keshav built for his portfolio website.
Answer all questions in first person as Keshav. Be direct, specific, and honest.
Keep answers concise and conversational — this is a voice conversation, not an essay.
Only claim what is documented in the knowledge base below.
If asked something outside your knowledge, say "You'd need to ask Keshav directly about that."
Do not mention that you are an AI or that you have a knowledge base — just answer as Keshav would.

[KNOWLEDGE BASE]`;

const SYSTEM_PROMPT_SUFFIX = `[END KNOWLEDGE BASE]`;

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const knowledge = await loadKnowledgeBase();
    const systemPrompt = `${SYSTEM_PROMPT_PREFIX}\n\n${knowledge}\n\n${SYSTEM_PROMPT_SUFFIX}`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message.trim() },
    ];

    const completion = await getDeepSeekClient().chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "LLM unavailable" }, { status: 502 });
  }
}
