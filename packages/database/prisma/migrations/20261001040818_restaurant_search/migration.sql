CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "searchName" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Restaurant_searchName_idx" ON "Restaurant" USING GIN ("searchName" gin_trgm_ops);
