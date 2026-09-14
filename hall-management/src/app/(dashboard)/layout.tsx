import Link from "next/link";
import { requireSession } from "@/lib/rbac";
import { SignOutButton } from "@/components/SignOutButton";
import type { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "מנהל מערכת",
  HALL_MANAGER: "מנהל אולם",
  ACCOUNTANT: "מנהלת חשבונות",
  TEAM: "קבוצה / שחקן",
};

function navFor(role: Role) {
  const common = [{ href: "/dashboard", label: "לוח בקרה" }];
  if (role === "ADMIN") {
    return [
      ...common,
      { href: "/dashboard/halls", label: "אולמות" },
      { href: "/dashboard/bookings", label: "לוח שיבוצים" },
      { href: "/dashboard/logliga", label: "סנכרון לוגליג" },
      { href: "/dashboard/reports", label: "דוחות" },
      { href: "/dashboard/admin/users", label: "משתמשים" },
    ];
  }
  if (role === "HALL_MANAGER") {
    return [...common, { href: "/dashboard/bookings", label: "לוח שיבוצים" }, { href: "/dashboard/reports", label: "דוחות" }];
  }
  if (role === "ACCOUNTANT") {
    return [...common, { href: "/dashboard/reports", label: "דוחות" }];
  }
  return [...common, { href: "/dashboard/book", label: "שריון אימון" }, { href: "/dashboard/bookings", label: "השיבוצים שלי" }];
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const nav = navFor(session.user.role);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-900">ניהול אולמות ואימונים</span>
            <nav className="flex gap-4 text-sm">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-600 hover:text-brand-600">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">
              {session.user.name} · {ROLE_LABELS[session.user.role]}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
