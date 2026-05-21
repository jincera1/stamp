import type { ExperiencePreview } from "@/lib/chat-log";
import { formatExperienceDate } from "@/lib/stamps";

export function ExperiencePreviewCard({
  preview,
}: {
  preview: ExperiencePreview;
}) {
  const tags = preview.tags?.filter(Boolean) ?? [];

  return (
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
      <p className="text-xs font-semibold tracking-[0.2em] text-violet-400">
        PREVIEW
      </p>
      {preview.title ? (
        <h3 className="mt-2 text-lg font-semibold text-white">{preview.title}</h3>
      ) : null}
      {preview.description ? (
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {preview.description}
        </p>
      ) : null}
      <dl className="mt-3 space-y-2 text-sm">
        {preview.place ? (
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">Place</dt>
            <dd className="text-zinc-200">{preview.place}</dd>
          </div>
        ) : null}
        {preview.occurred_at ? (
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">When</dt>
            <dd className="text-zinc-200">
              {formatExperienceDate(preview.occurred_at)}
            </dd>
          </div>
        ) : null}
      </dl>
      {tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-xs text-zinc-500">
        Reply to confirm or ask for changes before saving.
      </p>
    </div>
  );
}
