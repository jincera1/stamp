import { formatExperienceDate, type Experience } from "@/lib/stamps";

export function ExperienceCard({
  experience,
  authorLabel,
}: {
  experience: Experience;
  authorLabel?: string;
}) {
  const tags = experience.tags?.filter(Boolean) ?? [];
  const when = experience.occurred_at ?? experience.created_at;

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700">
      {authorLabel ? (
        <p className="text-xs font-medium text-violet-400">{authorLabel}</p>
      ) : null}
      <h3
        className={`text-lg font-semibold text-white ${authorLabel ? "mt-1" : ""}`}
      >
        {experience.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        {experience.description}
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        {experience.place ? (
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">Place</dt>
            <dd className="text-zinc-200">{experience.place}</dd>
          </div>
        ) : null}
        {when ? (
          <div className="flex gap-2">
            <dt className="shrink-0 text-zinc-500">When</dt>
            <dd className="text-zinc-200">{formatExperienceDate(when)}</dd>
          </div>
        ) : null}
      </dl>
      {tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
