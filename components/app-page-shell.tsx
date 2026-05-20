export function AppPageShell({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-4 py-8">
      <p className="text-xs font-semibold tracking-[0.3em] text-violet-400">
        STAMP
      </p>
      <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}
