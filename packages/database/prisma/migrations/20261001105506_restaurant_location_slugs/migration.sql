-- DropIndex
DROP INDEX "Restaurant_city_district_idx";

-- DropIndex
DROP INDEX "Restaurant_city_idx";

-- DropIndex
DROP INDEX "Restaurant_district_idx";

-- DropIndex
DROP INDEX "Restaurant_status_city_idx";

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "citySlug" TEXT,
ADD COLUMN     "districtSlug" TEXT;
-- backfill existing rows
UPDATE "Restaurant" SET "citySlug" = lower(replace(city, ' ', '-'));
UPDATE "Restaurant" SET "districtSlug" = lower(replace(district, ' ', '-')) WHERE district IS NOT NULL;

ALTER TABLE "Restaurant" ALTER COLUMN "citySlug" SET NOT NULL;
-- CreateIndex
CREATE INDEX "Restaurant_citySlug_idx" ON "Restaurant"("citySlug");

-- CreateIndex
CREATE INDEX "Restaurant_districtSlug_idx" ON "Restaurant"("districtSlug");

-- CreateIndex
CREATE INDEX "Restaurant_citySlug_districtSlug_idx" ON "Restaurant"("citySlug", "districtSlug");

-- CreateIndex
CREATE INDEX "Restaurant_status_citySlug_idx" ON "Restaurant"("status", "citySlug");
