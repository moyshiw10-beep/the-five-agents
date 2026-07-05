"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-orange-500 text-white font-semibold py-3 text-base disabled:opacity-60 active:scale-[0.98] transition"
    >
      {pending ? "שומר..." : label}
    </button>
  );
}
