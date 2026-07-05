import { logout } from "@/app/actions/auth";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-neutral-500 active:text-neutral-800"
        >
          יציאה
        </button>
      </form>
    </header>
  );
}
