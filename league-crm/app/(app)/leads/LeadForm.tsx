"use client";

import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/app/lib/definitions";
import { SubmitButton } from "@/app/components/SubmitButton";

type LeadDefaults = {
  name?: string;
  phone?: string;
  notes?: string | null;
  status?: string;
  nextFollowUpDate?: Date | null;
};

function toDateInputValue(date?: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function LeadForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: LeadDefaults;
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
          required
          dir="ltr"
          defaultValue={defaults?.phone}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </Field>

      <Field label="סטטוס" htmlFor="status">
        <select
          id="status"
          name="status"
          defaultValue={defaults?.status ?? "NEW"}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="תאריך מעקב הבא" htmlFor="nextFollowUpDate">
        <input
          id="nextFollowUpDate"
          name="nextFollowUpDate"
          type="date"
          defaultValue={toDateInputValue(defaults?.nextFollowUpDate)}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
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
