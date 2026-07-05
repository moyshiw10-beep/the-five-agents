"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "דשבורד", icon: "🏠" },
  { href: "/leads", label: "לידים", icon: "📋" },
  { href: "/players", label: "שחקנים", icon: "🏀" },
  { href: "/teams", label: "קבוצות", icon: "👥" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex pb-[env(safe-area-inset-bottom)] z-20">
      {TABS.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium ${
              active ? "text-orange-500" : "text-neutral-500"
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
