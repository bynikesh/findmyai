-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "allow_reviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "api_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "api_docs_url" TEXT,
ADD COLUMN     "brand_color_primary" TEXT,
ADD COLUMN     "brand_color_secondary" TEXT,
ADD COLUMN     "click_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "company_size" TEXT,
ADD COLUMN     "cons" TEXT[],
ADD COLUMN     "editors_choice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "free_trial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ideal_for" TEXT,
ADD COLUMN     "integrations" TEXT[],
ADD COLUMN     "key_features" TEXT[],
ADD COLUMN     "open_source" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price_range" TEXT,
ADD COLUMN     "pricing_type" TEXT,
ADD COLUMN     "primary_model" TEXT,
ADD COLUMN     "pros" TEXT[],
ADD COLUMN     "release_year" INTEGER,
ADD COLUMN     "repo_url" TEXT,
ADD COLUMN     "seo_meta_description" TEXT,
ADD COLUMN     "seo_title" TEXT,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "social_share_image" TEXT,
ADD COLUMN     "still_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "trending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "use_cases" TEXT[],
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Tool_featured_idx" ON "Tool"("featured");

-- CreateIndex
CREATE INDEX "Tool_verified_idx" ON "Tool"("verified");
