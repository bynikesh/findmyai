-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_content" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_h1" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "average_rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "is_trending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trending_score" DOUBLE PRECISION DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_featured_idx" ON "Category"("featured");

-- CreateIndex
CREATE INDEX "Tool_trending_score_idx" ON "Tool"("trending_score");

-- CreateIndex
CREATE INDEX "Tool_is_trending_idx" ON "Tool"("is_trending");
