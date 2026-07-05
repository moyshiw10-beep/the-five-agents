"use client";

import { STATUS_LABELS } from "@/app/lib/definitions";
import { SubmitButton } from "@/app/components/SubmitButton";

type PlayerDefaults = {
  name?: string;
  phone?: string | null;
  notes?: string | null;
  status?: string;
  teamId?: string | null;
};

export function PlayerForm({
  action,
  defaults,
  teams,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: PlayerDefaults;
  teams: { id: string; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 flex flex-col gap-4">
      <Field label="שם" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaults?.name}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      <Field label="טלפון" htmlFor="phone">
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          defaultValue={defaults?.phone ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      <Field label="קבוצה" htmlFor="teamId">
        <select
          id="teamId"
          name="teamId"
          defaultValue={defaults?.teamId ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">ללא קבוצה</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="סטטוס" htmlFor="status">
        <select
          id="status"
          name="status"
          defaultValue={defaults?.status ?? "ACTIVE"}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="ACTIVE">{STATUS_LABELS.ACTIVE}</option>
          <option value="PAST">{STATUS_LABELS.PAST}</option>
        </select>
      </Field>

      <Field label="הערות" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults?.notes ?? ""}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
}
