-- CreateTable
CREATE TABLE "AiDailyUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "turns" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiDailyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiDailyUsage_userId_date_key" ON "AiDailyUsage"("userId", "date");

-- AddForeignKey
ALTER TABLE "AiDailyUsage" ADD CONSTRAINT "AiDailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- PostgREST(anon key) 노출 차단 — Prisma는 테이블 owner라 영향 없음
ALTER TABLE "AiDailyUsage" ENABLE ROW LEVEL SECURITY;
