"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppPageShell } from "@/components/app-page-shell";
import { ExperienceCard } from "@/components/experience-card";
import { PageEmpty, PageError, PageLoading } from "@/components/page-feedback";
import {
  profileDisplayName,
  type Experience,
  type Profile,
} from "@/lib/experiences";
import { supabase } from "@/utils/supabase";

export default function DiscoverPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    const { data: rows, error: fetchError } = await supabase
      .from("experiences")
      .select(
        "id, user_id, title, description, place, tags, occurred_at, created_at"
      )
      .neq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(fetchError.message);
      setExperiences([]);
      setProfilesById({});
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as Experience[];
    setExperiences(list);

    const authorIds = [...new Set(list.map((e) => e.user_id))];
    if (authorIds.length === 0) {
      setProfilesById({});
      setLoading(false);
      return;
    }

    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .in("id", authorIds);

    if (profileError) {
      setProfilesById({});
    } else {
      const map: Record<string, Profile> = {};
      for (const p of (profileRows ?? []) as Profile[]) {
        map[p.id] = p;
      }
      setProfilesById(map);
    }

    setLoading(false);
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
      setUserId(user.id);
      await loadFeed(user.id);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadFeed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiences;
    return experiences.filter((e) => {
      const haystack = [
        e.title,
        e.description,
        e.place ?? "",
        ...(e.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [experiences, query]);

  return (
    <div>
      <AppPageShell
        title="Discover"
        description="Browse stamps from other STAMP users."
      />

      <div className="space-y-4 px-4 pb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, place, tags…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
          aria-label="Search stamps"
        />

        {loading ? <PageLoading label="Loading stamps…" /> : null}
        {!loading && error ? <PageError message={error} /> : null}
        {!loading && !error && filtered.length === 0 ? (
          <PageEmpty
            title={
              experiences.length === 0
                ? "No stamps to discover yet"
                : "No matches for your search"
            }
            description={
              experiences.length === 0
                ? "When others log stamps, they will show up here. Log your own on the + tab."
                : "Try a different keyword or clear the search box."
            }
          />
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <ul className="space-y-3">
            {filtered.map((exp) => (
              <li key={exp.id}>
                <ExperienceCard
                  experience={exp}
                  authorLabel={profileDisplayName(profilesById[exp.user_id])}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
