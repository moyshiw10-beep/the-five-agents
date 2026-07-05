"use client";

import { STATUS_LABELS } from "@/app/lib/definitions";
import { SubmitButton } from "@/app/components/SubmitButton";

type TeamDefaults = {
  name?: string;
  notes?: string | null;
  status?: string;
};

export function TeamForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: TeamDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="p-4 flex flex-col gap-4">
      <Field label="שם הקבוצה" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaults?.name}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
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
