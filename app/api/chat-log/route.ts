import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CHAT_LOG_SYSTEM_PROMPT, type ChatMessage } from "@/lib/chat-log";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

function anthropicHttpStatus(err: unknown): number {
  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  ) {
    const status = (err as { status: number }).status;
    if (status >= 400 && status < 600) return status;
  }
  return 502;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required." },
      { status: 400 }
    );
  }

  for (const msg of messages) {
    if (
      !msg ||
      (msg.role !== "user" && msg.role !== "assistant") ||
      typeof msg.content !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Each message must have role user|assistant and string content.",
        },
        { status: 400 }
      );
    }
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CHAT_LOG_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from assistant." },
        { status: 502 }
      );
    }

    return NextResponse.json({ content: text });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Anthropic request failed.";
    console.error("[chat-log]", message);
    return NextResponse.json(
      { error: message },
      { status: anthropicHttpStatus(err) }
    );
  }
}
