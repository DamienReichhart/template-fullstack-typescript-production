-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "status" "VideoStatus" NOT NULL,
    "source_key" TEXT NOT NULL,
    "file_key" TEXT,
    "file_size" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "duration_seconds" DOUBLE PRECISION,
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videos_owner_id_created_at_idx" ON "videos"("owner_id", "created_at");
