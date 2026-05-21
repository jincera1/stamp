"use client";

import { useCallback, useEffect, useState } from "react";
import { AppPageShell } from "@/components/app-page-shell";
import { PageEmpty, PageError, PageLoading } from "@/components/page-feedback";
import { profileDisplayName, type Profile } from "@/lib/stamps";
import { supabase } from "@/utils/supabase";

export default function FriendsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStampers = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .neq("id", uid)
      .order("display_name", { ascending: true, nullsFirst: false })
      .order("email", { ascending: true });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      setProfiles([]);
      return;
    }

    setProfiles((data ?? []) as Profile[]);
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
      await loadStampers(user.id);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadStampers]);

  return (
    <div>
      <AppPageShell
        title="Friends"
        description="Other STAMP users — follow their stamps on Discover."
      />

      <div className="px-4 pb-8">
        {loading ? <PageLoading label="Loading stampers…" /> : null}
        {!loading && error ? <PageError message={error} /> : null}
        {!loading && !error && profiles.length === 0 ? (
          <PageEmpty
            title="No other stampers yet"
            description="Invite friends to sign up. Their profiles will appear here."
          />
        ) : null}

        {!loading && !error && profiles.length > 0 ? (
          <ul className="space-y-2">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-semibold text-violet-300"
                    aria-hidden
                  >
                    {profileDisplayName(profile).charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {profileDisplayName(profile)}
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
