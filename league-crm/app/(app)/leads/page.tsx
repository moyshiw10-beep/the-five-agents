import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { prisma } from "@/app/lib/db";
import { TopBar } from "@/app/components/TopBar";
import { Fab } from "@/app/components/Fab";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/app/lib/definitions";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const filter =
    status && (LEAD_STATUSES as readonly string[]).includes(status)
      ? (status as LeadStatus)
      : undefined;

  const leads = await prisma.lead.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <TopBar title="לידים" />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 -mb-1">
        <FilterChip href="/leads" label="הכול" active={!filter} />
        {LEAD_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/leads?status=${s}`}
            label={LEAD_STATUS_LABELS[s]}
            active={filter === s}
          />
        ))}
      </div>

      <div className="p-4 pt-2 flex flex-col gap-2">
        {leads.length === 0 ? (
          <p className="text-sm text-neutral-500 bg-white border border-neutral-200 rounded-xl p-4 text-center">
            אין עדיין לידים
          </p>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3 active:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{lead.name}</p>
                <p className="text-sm text-neutral-500" dir="ltr">
                  {lead.phone}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 shrink-0">
                {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
              </span>
            </Link>
          ))
        )}
      </div>

      <Fab href="/leads/new" />
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-white border-neutral-200 text-neutral-600"
      }`}
    >
      {label}
    </Link>
  );
}
