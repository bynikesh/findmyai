-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "importLogId" INTEGER;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_importLogId_fkey" FOREIGN KEY ("importLogId") REFERENCES "ImportLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
