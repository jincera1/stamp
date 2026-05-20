export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <p className="py-8 text-center text-sm text-zinc-500" role="status">
      {label}
    </p>
  );
}

export function PageEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-10 text-center">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}

export function PageError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
      {message}
    </p>
  );
}
