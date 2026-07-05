import Link from "next/link";

export function Fab({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="fixed bottom-20 left-4 z-20 w-14 h-14 rounded-full bg-orange-500 text-white text-3xl flex items-center justify-center shadow-lg active:scale-95 transition"
      aria-label="הוסף"
    >
      +
    </Link>
  );
}
