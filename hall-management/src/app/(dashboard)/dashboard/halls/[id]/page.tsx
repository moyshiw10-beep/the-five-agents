import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { addHallUnit, removeHallUnit, setHallManagers } from "@/lib/actions/halls";
import { notFound } from "next/navigation";

export default async function HallDetailPage({ params }: { params: { id: string } }) {
  await requireRole("ADMIN");
  const hall = await prisma.hall.findUnique({
    where: { id: params.id },
    include: { units: true, managers: true },
  });
  if (!hall) notFound();

  const managerCandidates = await prisma.user.findMany({
    where: { role: "HALL_MANAGER" },
    orderBy: { name: "asc" },
  });

  async function updateManagers(formData: FormData) {
    "use server";
    const ids = formData.getAll("managerIds").map(String);
    await setHallManagers(hall!.id, ids);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{hall.name}</h1>
        <p className="text-sm text-slate-500">{hall.address}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-medium">יחידות באולם</h2>
          <ul className="mb-3 space-y-2">
            {hall.units.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <span>{u.name}</span>
                <form
                  action={async () => {
                    "use server";
                    await removeHallUnit(hall!.id, u.id);
                  }}
                >
                  <button className="text-red-600">הסרה</button>
                </form>
              </li>
            ))}
            {hall.units.length === 0 && <p className="text-sm text-slate-500">אין יחידות עדיין</p>}
          </ul>
          <form
            action={async (formData: FormData) => {
              "use server";
              await addHallUnit(hall!.id, formData);
            }}
            className="flex gap-2"
          >
            <input name="name" placeholder="לדוגמה: מגרש 1" required className="input" />
            <button className="btn">הוספה</button>
          </form>
        </div>

        <div className="card">
          <h2 className="mb-3 font-medium">מנהלי האולם</h2>
          <form action={updateManagers} className="space-y-3">
            <div className="space-y-1">
              {managerCandidates.map((m) => (
                <label key={m.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="managerIds"
                    value={m.id}
                    defaultChecked={hall.managers.some((hm) => hm.id === m.id)}
                  />
                  {m.name} ({m.email})
                </label>
              ))}
              {managerCandidates.length === 0 && (
                <p className="text-sm text-slate-500">אין עדיין משתמשים בתפקיד "מנהל אולם"</p>
              )}
            </div>
            <button className="btn">שמירה</button>
          </form>
        </div>
      </div>
    </div>
  );
}
