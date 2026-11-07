-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'HALL_MANAGER', 'ACCOUNTANT', 'TEAM');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('LOGLIGA', 'TRAINING', 'MANUAL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "logligaVenueId" TEXT,
    "reportEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HallUnit" (
    "id" TEXT NOT NULL,
    "hallId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HallUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueBooking" (
    "id" TEXT NOT NULL,
    "hallUnitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "homeTeamName" TEXT,
    "awayTeamName" TEXT,
    "competitionName" TEXT,
    "logligaGameId" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingBooking" (
    "id" TEXT NOT NULL,
    "hallUnitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "teamId" TEXT,
    "createdById" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "source" "BookingSource" NOT NULL DEFAULT 'TRAINING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogligaSyncLog" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "gamesFound" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "LogligaSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "hallId" TEXT,
    "recipient" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "ReportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_HallManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Hall_logligaVenueId_idx" ON "Hall"("logligaVenueId");

-- CreateIndex
CREATE INDEX "HallUnit_hallId_idx" ON "HallUnit"("hallId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueBooking_logligaGameId_key" ON "LeagueBooking"("logligaGameId");

-- CreateIndex
CREATE INDEX "LeagueBooking_hallUnitId_date_idx" ON "LeagueBooking"("hallUnitId", "date");

-- CreateIndex
CREATE INDEX "TrainingBooking_hallUnitId_date_idx" ON "TrainingBooking"("hallUnitId", "date");

-- CreateIndex
CREATE INDEX "ReportLog_type_periodStart_hallId_idx" ON "ReportLog"("type", "periodStart", "hallId");

-- CreateIndex
CREATE UNIQUE INDEX "_HallManagers_AB_unique" ON "_HallManagers"("A", "B");

-- CreateIndex
CREATE INDEX "_HallManagers_B_index" ON "_HallManagers"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HallUnit" ADD CONSTRAINT "HallUnit_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueBooking" ADD CONSTRAINT "LeagueBooking_hallUnitId_fkey" FOREIGN KEY ("hallUnitId") REFERENCES "HallUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingBooking" ADD CONSTRAINT "TrainingBooking_hallUnitId_fkey" FOREIGN KEY ("hallUnitId") REFERENCES "HallUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingBooking" ADD CONSTRAINT "TrainingBooking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingBooking" ADD CONSTRAINT "TrainingBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HallManagers" ADD CONSTRAINT "_HallManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Hall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HallManagers" ADD CONSTRAINT "_HallManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
