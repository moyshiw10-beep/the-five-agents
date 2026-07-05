"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-50 px-4">
      <form
        action={action}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col gap-4"
      >
        <div className="text-center">
          <div className="text-3xl mb-1">🏀</div>
          <h1 className="text-xl font-bold text-neutral-900">
            ניהול ליגה
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            הזן סיסמה כדי להיכנס
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            סיסמה
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 text-center">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-orange-500 text-white font-semibold py-3 text-base disabled:opacity-60 active:scale-[0.98] transition"
        >
          {pending ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
