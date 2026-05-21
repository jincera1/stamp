"use client";

import { useCallback, useEffect, useState } from "react";
import { AppPageShell } from "@/components/app-page-shell";
import { ExperienceCard } from "@/components/experience-card";
import { PageEmpty, PageError, PageLoading } from "@/components/page-feedback";
import type { Experience } from "@/lib/stamps";
import { supabase } from "@/utils/supabase";

export default function ArchivePage() {
  const [stamps, setstamps] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArchive = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("stamps")
      .select(
        "id, user_id, title, description, place, tags, occurred_at, created_at"
      )
      .eq("user_id", uid)
      .order("occurred_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      setstamps([]);
      return;
    }

    setstamps((data ?? []) as Experience[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setLoading(false);
        return;
      }
      await loadArchive(user.id);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadArchive]);

  return (
    <div>
      <AppPageShell
        title="Archive"
        description="Your saved stamps from conversational logging."
      />

      <div className="px-4 pb-8">
        {loading ? <PageLoading label="Loading your archive…" /> : null}
        {!loading && error ? <PageError message={error} /> : null}
        {!loading && !error && stamps.length === 0 ? (
          <PageEmpty
            title="Your archive is empty"
            description="Log a stamp on the + tab and confirm the preview to save it here."
          />
        ) : null}

        {!loading && !error && stamps.length > 0 ? (
          <ul className="space-y-3">
            {stamps.map((exp) => (
              <li key={exp.id}>
                <ExperienceCard experience={exp} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
