"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/logliga/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMessage(`נמצאו ${data.gamesFound} משחקים ב-${data.hallsProcessed} אולמות`);
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && <span className="text-sm text-slate-600">{message}</span>}
      <button onClick={onClick} disabled={loading} className="btn">
        {loading ? "מסנכרן..." : "סנכרון עכשיו"}
      </button>
    </div>
  );
}
