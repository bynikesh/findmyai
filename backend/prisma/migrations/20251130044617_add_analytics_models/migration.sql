-- CreateTable
CREATE TABLE "ToolView" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" VARCHAR(64),

    CONSTRAINT "ToolView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalClick" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(64),

    CONSTRAINT "ExternalClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryView" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionEvent" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTool" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingCategory" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolView_toolId_createdAt_idx" ON "ToolView"("toolId", "createdAt");

-- CreateIndex
CREATE INDEX "ExternalClick_toolId_createdAt_idx" ON "ExternalClick"("toolId", "createdAt");

-- CreateIndex
CREATE INDEX "CategoryView_categoryId_createdAt_idx" ON "CategoryView"("categoryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingTool_toolId_snapshotAt_key" ON "TrendingTool"("toolId", "snapshotAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrendingCategory_categoryId_snapshotAt_key" ON "TrendingCategory"("categoryId", "snapshotAt");

-- AddForeignKey
ALTER TABLE "ToolView" ADD CONSTRAINT "ToolView_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalClick" ADD CONSTRAINT "ExternalClick_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryView" ADD CONSTRAINT "CategoryView_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionEvent" ADD CONSTRAINT "SubmissionEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingTool" ADD CONSTRAINT "TrendingTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingCategory" ADD CONSTRAINT "TrendingCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
