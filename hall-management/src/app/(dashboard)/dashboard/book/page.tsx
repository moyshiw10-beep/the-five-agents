import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getHallDayAvailability } from "@/lib/availability";
import { createTrainingBooking } from "@/lib/actions/bookings";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABEL: Record<string, string> = {
  free: "פנוי",
  league: "משחק ליגה",
  training: "משוריין",
};

const STATUS_CLASS: Record<string, string> = {
  free: "bg-green-50 text-green-700 border-green-200",
  league: "bg-red-50 text-red-700 border-red-200",
  training: "bg-amber-50 text-amber-700 border-amber-200",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: { hallId?: string; date?: string };
}) {
  await requireRole("TEAM", "ADMIN", "HALL_MANAGER");
  const halls = await prisma.hall.findMany({ orderBy: { name: "asc" } });
  const hallId = searchParams.hallId ?? halls[0]?.id;
  const date = searchParams.date ?? todayStr();

  const availability = hallId ? await getHallDayAvailability(hallId, new Date(`${date}T00:00:00`)) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">שריון אימון</h1>

      <form className="card flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="label">אולם</label>
          <select name="hallId" defaultValue={hallId} className="input">
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">תאריך</label>
          <input type="date" name="date" defaultValue={date} className="input" />
        </div>
        <button className="btn">הצג זמינות</button>
      </form>

      {halls.length === 0 && <p className="text-slate-500">טרם הוגדרו אולמות במערכת.</p>}

      {availability.map((unit) => (
        <div key={unit.hallUnitId} className="card">
          <h2 className="mb-3 font-medium">{unit.hallUnitName}</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {unit.slots.map((slot) => (
              <div
                key={slot.startTime}
                className={`rounded-lg border p-2 text-center text-xs ${STATUS_CLASS[slot.status]}`}
              >
                <div className="font-medium">{slot.startTime}</div>
                <div>{STATUS_LABEL[slot.status]}</div>
                {slot.status === "free" && (
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await createTrainingBooking(formData);
                    }}
                    className="mt-1"
                  >
                    <input type="hidden" name="hallUnitId" value={unit.hallUnitId} />
                    <input type="hidden" name="date" value={date} />
                    <input type="hidden" name="startTime" value={slot.startTime} />
                    <input type="hidden" name="endTime" value={slot.endTime} />
                    <button className="w-full rounded bg-green-600 px-1 py-0.5 text-white">
                      שריון
                    </button>
                  </form>
                )}
                {slot.status !== "free" && "label" in slot && (
                  <div className="mt-1 truncate" title={slot.label}>
                    {slot.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
