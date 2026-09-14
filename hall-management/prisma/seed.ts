import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "מנהל המערכת",
      role: "ADMIN",
      passwordHash,
    },
  });

  const hallManager = await prisma.user.upsert({
    where: { email: "hallmanager@example.com" },
    update: {},
    create: {
      email: "hallmanager@example.com",
      name: "מנהל אולם דוגמה",
      role: "HALL_MANAGER",
      passwordHash,
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: "accounting@example.com" },
    update: {},
    create: {
      email: "accounting@example.com",
      name: "מנהלת חשבונות",
      role: "ACCOUNTANT",
      passwordHash,
    },
  });

  const team = await prisma.team.upsert({
    where: { id: "seed-team-1" },
    update: {},
    create: { id: "seed-team-1", name: "קבוצת דוגמה", contactEmail: "team@example.com" },
  });

  const teamUser = await prisma.user.upsert({
    where: { email: "team@example.com" },
    update: {},
    create: {
      email: "team@example.com",
      name: "נציג קבוצת דוגמה",
      role: "TEAM",
      passwordHash,
      teamId: team.id,
    },
  });

  const hall = await prisma.hall.upsert({
    where: { id: "seed-hall-1" },
    update: {},
    create: {
      id: "seed-hall-1",
      name: "אולם הספורט העירוני",
      address: "רחוב הדוגמה 1, תל אביב",
      logligaVenueId: "12345",
      managers: { connect: [{ id: hallManager.id }] },
      units: {
        create: [{ name: "מגרש 1" }, { name: "מגרש 2" }],
      },
    },
  });

  console.log("נתוני דמו נוצרו:");
  console.log({ admin: admin.email, hallManager: hallManager.email, accountant: accountant.email, teamUser: teamUser.email, hall: hall.name });
  console.log('סיסמה לכל המשתמשים: "password123"');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
