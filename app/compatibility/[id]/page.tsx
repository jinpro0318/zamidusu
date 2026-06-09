import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { CompatibilityResult } from "@/components/compatibility/CompatibilityResult";
import type { CompatibilityScore } from "@/lib/iztro/compatibility";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "궁합 결과" };

export default async function CompatibilityResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const rec = await db.compatibility.findFirst({
    where: { id, ownerId: userId },
    include: { chartA: true, chartB: true },
  });
  if (!rec) notFound();

  const score = JSON.parse(rec.detail) as CompatibilityScore;

  return (
    <main className="mx-auto max-w-md px-5 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href="/compatibility"
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text"
        >
          <ChevronLeft className="size-4" /> 다시 보기
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">合婚</span>
      </header>

      <div className="mt-2 text-center">
        <h1 className="font-display text-2xl font-bold">궁합 결과</h1>
      </div>

      <div className="mt-6">
        <CompatibilityResult
          score={score}
          nameA={rec.chartA.subjectName ?? "A"}
          nameB={rec.chartB.subjectName ?? "B"}
        />
      </div>

      <p className="mt-8 text-[11px] text-muted/80 leading-relaxed">
        ※ 점수는 자미두수 12궁·사화·오행국을
        <br />
        가중 합산한 추정치입니다. 절대적 호환도가 아닙니다.
      </p>
    </main>
  );
}
