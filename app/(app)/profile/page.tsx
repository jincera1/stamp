"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppPageShell } from "@/components/app-page-shell";
import { PageError, PageLoading } from "@/components/page-feedback";
import type { Profile } from "@/lib/experiences";
import { supabase } from "@/utils/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("id, email, display_name, created_at, updated_at")
      .eq("id", uid)
      .maybeSingle();

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      setProfile(null);
      return;
    }

    const row = data as Profile | null;
    setProfile(row);
    setDisplayName(row?.display_name?.trim() ?? "");
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
      await loadProfile(user.id);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || saving) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const trimmed = displayName.trim();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: trimmed || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProfile((prev) =>
      prev ? { ...prev, display_name: trimmed || null } : prev
    );
    setNotice("Profile updated.");
  }

  async function handleSignOut() {
    setError(null);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div>
      <AppPageShell
        title="Profile"
        description="Your STAMP account and display name."
      />

      <div className="space-y-4 px-4 pb-8">
        {loading ? <PageLoading label="Loading profile…" /> : null}

        {!loading && error ? <PageError message={error} /> : null}
        {notice ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {notice}
          </p>
        ) : null}

        {!loading && profile ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-400"
              />
            </div>

            <div>
              <label
                htmlFor="displayName"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How friends see you"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        ) : null}

        {!loading ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white"
          >
            Sign out
          </button>
        ) : null}
      </div>
    </div>
  );
}
