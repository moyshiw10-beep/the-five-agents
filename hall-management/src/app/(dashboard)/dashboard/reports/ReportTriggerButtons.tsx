"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportTriggerButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function trigger(kind: "hall-usage" | "monthly") {
    setLoading(kind);
    setMessage(null);
    try {
      const res = await fetch(`/api/reports/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMessage("הדוח נשלח (ראו פרטים בטבלת ההיסטוריה למטה)");
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="card flex flex-wrap items-center gap-3">
      <button className="btn" disabled={!!loading} onClick={() => trigger("hall-usage")}>
        {loading === "hall-usage" ? "שולח..." : "שליחת דוח שימוש (7 ימים אחרונים) לכל מנהלי האולמות"}
      </button>
      <button className="btn-secondary" disabled={!!loading} onClick={() => trigger("monthly")}>
        {loading === "monthly" ? "שולח..." : "שליחת דוח חודשי למנהלת חשבונות"}
      </button>
      {message && <span className="text-sm text-slate-600">{message}</span>}
    </div>
  );
}
