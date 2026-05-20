"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

/**
 * Client-side auth guard using the browser Supabase client in utils/supabase.ts.
 * For cookie-based SSR session checks (middleware, server layouts), add @supabase/ssr
 * and a server client — this guard remains useful for client-only session sync.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setReady(false);
        router.replace("/login");
      } else if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-950">
        <p className="text-sm tracking-wide text-zinc-400">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
