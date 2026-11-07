-- AlterTable
ALTER TABLE "TrainingBooking" ADD COLUMN "importKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TrainingBooking_importKey_key" ON "TrainingBooking"("importKey");
