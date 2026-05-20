/** Anthropic system prompt for conversational experience logging (STAMP protocol). */
export const CHAT_LOG_SYSTEM_PROMPT = `You are STAMP's conversational logging assistant. Help the user record a stamp (a memorable experience, place, or moment) in natural language.

Workflow:
1. Ask brief clarifying questions if needed (what, where, when, mood, who was there).
2. When you have enough detail to summarize, include a single line starting with exactly PREVIEW| followed by compact JSON (no markdown fences). JSON shape:
   {"title":"short title","description":"1-3 sentence summary","place":"optional location","tags":["optional","tags"],"occurred_at":"optional ISO-8601 datetime"}
3. After the user confirms (e.g. yes, save it, looks good), reply with a short confirmation and include the exact token LOG_SAVED on its own line. You may repeat the same PREVIEW| JSON line before LOG_SAVED so the client can persist it.

Rules:
- Keep replies concise and friendly.
- Do not invent specific addresses unless the user mentioned them.
- Never use VIVID branding; the product is STAMP only.
- PREVIEW| and LOG_SAVED are machine tokens; still write human-readable text around them.`;

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** Structured stamp preview emitted after PREVIEW| */
export type ExperiencePreview = {
  title?: string;
  description?: string;
  place?: string;
  tags?: string[];
  occurred_at?: string;
};

const PREVIEW_PREFIX = "PREVIEW|";
const LOG_SAVED_MARKER = "LOG_SAVED";

export function parseExperiencePreview(text: string): ExperiencePreview | null {
  const idx = text.indexOf(PREVIEW_PREFIX);
  if (idx === -1) return null;

  let payload = text.slice(idx + PREVIEW_PREFIX.length).trim();

  const logSavedIdx = payload.indexOf(LOG_SAVED_MARKER);
  if (logSavedIdx !== -1) {
    payload = payload.slice(0, logSavedIdx).trim();
  }

  const newlineIdx = payload.indexOf("\n");
  if (newlineIdx !== -1) {
    const firstLine = payload.slice(0, newlineIdx).trim();
    const parsed = tryParsePreviewJson(firstLine);
    if (parsed) return parsed;
  }

  return tryParsePreviewJson(payload);
}

function tryParsePreviewJson(raw: string): ExperiencePreview | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const data = JSON.parse(trimmed) as Record<string, unknown>;
    return normalizePreview(data);
  } catch {
    const braceStart = trimmed.indexOf("{");
    const braceEnd = trimmed.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      try {
        const data = JSON.parse(
          trimmed.slice(braceStart, braceEnd + 1)
        ) as Record<string, unknown>;
        return normalizePreview(data);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizePreview(data: Record<string, unknown>): ExperiencePreview {
  const tags = data.tags;
  return {
    title: typeof data.title === "string" ? data.title : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.content === "string"
          ? data.content
          : undefined,
    place: typeof data.place === "string" ? data.place : undefined,
    tags: Array.isArray(tags)
      ? tags.filter((t): t is string => typeof t === "string")
      : undefined,
    occurred_at:
      typeof data.occurred_at === "string" ? data.occurred_at : undefined,
  };
}

export function assistantHasLogSaved(text: string): boolean {
  return text.includes(LOG_SAVED_MARKER);
}

/** User-visible assistant text with machine markers removed. */
export function stripAssistantMarkers(text: string): string {
  let out = text;

  const previewIdx = out.indexOf(PREVIEW_PREFIX);
  if (previewIdx !== -1) {
    const before = out.slice(0, previewIdx).trimEnd();
    const afterPayload = out.slice(previewIdx + PREVIEW_PREFIX.length);
    const parsed = tryParsePreviewJson(afterPayload.split("\n")[0] ?? afterPayload);
    if (parsed) {
      const jsonEnd = afterPayload.indexOf("\n");
      const rest =
        jsonEnd === -1
          ? ""
          : afterPayload
              .slice(jsonEnd)
              .replace(/^\s*\n?/, "")
              .trim();
      out = [before, rest].filter(Boolean).join("\n\n");
    } else {
      out = out.replace(/PREVIEW\|[\s\S]*?(?=\n\n|$)/, "").trim();
    }
  }

  out = out.replace(new RegExp(`\\s*${LOG_SAVED_MARKER}\\s*`, "g"), "").trim();
  return out;
}

export function buildExperienceInsert(
  userId: string,
  preview: ExperiencePreview | null,
  fallbackDescription?: string
) {
  const description =
    preview?.description?.trim() ||
    fallbackDescription?.trim() ||
    "Logged experience";

  return {
    user_id: userId,
    title: preview?.title?.trim() || "New stamp",
    description,
    place: preview?.place?.trim() || null,
    tags: preview?.tags?.length ? preview.tags : null,
    occurred_at: preview?.occurred_at || null,
  };
}
