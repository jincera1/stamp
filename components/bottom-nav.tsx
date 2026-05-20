"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  prominent?: boolean;
};

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center [&>svg]:h-6 [&>svg]:w-6">
      {children}
    </span>
  );
}

const discoverIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polygon
      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const archiveIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

const plusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const friendsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const profileIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/discover", label: "Discover", icon: discoverIcon },
  { href: "/archive", label: "Archive", icon: archiveIcon },
  { href: "/log", label: "Log", icon: plusIcon, prominent: true },
  { href: "/friends", label: "Friends", icon: friendsIcon },
  { href: "/profile", label: "Profile", icon: profileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Main"
    >
      <ul className="mx-auto flex h-16 max-w-lg items-end justify-around px-2">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/discover" && pathname.startsWith(`${item.href}/`));

          if (item.prominent) {
            return (
              <li key={item.href} className="flex flex-1 justify-center">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className="-mt-5 flex flex-col items-center gap-1"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-900/50 ring-4 ring-zinc-950 transition hover:bg-violet-500">
                    <NavIcon>{item.icon}</NavIcon>
                  </span>
                  <span
                    className={`text-[10px] font-medium ${active ? "text-violet-400" : "text-zinc-500"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex flex-1 justify-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2 transition ${
                  active ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <NavIcon>{item.icon}</NavIcon>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
