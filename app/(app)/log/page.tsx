"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ExperiencePreviewCard } from "@/components/experience-preview-card";
import {
  assistantHasLogSaved,
  buildExperienceInsert,
  parseExperiencePreview,
  stripAssistantMarkers,
  type ChatMessage,
  type ExperiencePreview,
} from "@/lib/chat-log";
import { supabase } from "@/utils/supabase";

type UiMessage = ChatMessage & {
  id: string;
  preview?: ExperiencePreview | null;
  saved?: boolean;
};

const WELCOME: UiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Tell me about a stamp you want to log — what happened, where, and when. I'll summarize it and show a preview before saving.",
};

export default function LogPage() {
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);
  const lastPreviewRef = useRef<ExperiencePreview | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const persistExperience = useCallback(
    async (preview: ExperiencePreview | null) => {
      if (!userId || savingRef.current) return;
      savingRef.current = true;
      setSaveNotice(null);

      const row = buildExperienceInsert(userId, preview);
      const { error: insertError } = await supabase
        .from("stamps")
        .insert(row);

      savingRef.current = false;

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSaveNotice("Stamp saved to your archive.");
      setError(null);
    },
    [userId]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setSaveNotice(null);

    const userMessage: UiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const apiMessages: ChatMessage[] = [
      ...messages
        .filter((m) => m.id !== "welcome")
        .map(({ role, content }) => ({ role, content })),
      { role: "user", content: text },
    ];

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = (await res.json()) as { content?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not reach the assistant.");
        return;
      }

      const raw = data.content ?? "";
      const preview = parseExperiencePreview(raw);
      if (preview) lastPreviewRef.current = preview;

      const shouldSave = assistantHasLogSaved(raw);
      const display = stripAssistantMarkers(raw) || "Done.";

      const assistantMessage: UiMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: display,
        preview,
        saved: shouldSave,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (shouldSave) {
        await persistExperience(preview ?? lastPreviewRef.current);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col px-4 pt-6">
      <header className="shrink-0 pb-4">
        <p className="text-xs font-semibold tracking-[0.3em] text-violet-400">
          STAMP
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Log</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Describe your experience; confirm when the preview looks right.
        </p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pb-4"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] space-y-3 ${
                msg.role === "user"
                  ? "rounded-2xl rounded-br-md bg-violet-600 px-4 py-2.5 text-sm text-white"
                  : "w-full max-w-full"
              }`}
            >
              {msg.role === "assistant" ? (
                <>
                  {msg.content ? (
                    <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  ) : null}
                  {msg.preview ? (
                    <ExperiencePreviewCard preview={msg.preview} />
                  ) : null}
                  {msg.saved ? (
                    <p className="text-xs font-medium text-emerald-400">
                      Saved to stamps
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading ? (
          <p className="text-sm text-zinc-500">Assistant is thinking…</p>
        ) : null}
      </div>

      {(error || saveNotice) && (
        <div className="shrink-0 space-y-2 pb-3">
          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          {saveNotice ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {saveNotice}
            </p>
          ) : null}
        </div>
      )}

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-zinc-800 pt-3 pb-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I had coffee at…"
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60"
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
