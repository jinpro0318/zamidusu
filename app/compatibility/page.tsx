import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { CompatibilityForm } from "./form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "자미두수 궁합" };

export default async function CompatibilityPage() {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();

  const charts = userId
    ? await db.chart.findMany({
        where: { userId },
        select: {
          id: true,
          subjectName: true,
          birthYear: true,
          birthMonth: true,
          birthDay: true,
          gender: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-md px-5 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text">
          <ChevronLeft className="size-4" /> 홈
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">合婚</span>
      </header>

      <div className="mt-2 text-center">
        <p className="font-display text-xs gold-text tracking-[0.4em]">合婚 · COMPATIBILITY</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight">
          자미두수 궁합
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          두 명반의 12궁·사화·오행국을 종합해
          <br />
          연애·직장·가족 호환도를 봅니다.
        </p>
      </div>

      {charts.length < 2 ? (
        <div className="mt-10 palace-card rounded-2xl p-6 text-center">
          <p className="text-sm text-muted">
            궁합을 보려면 명반 2개 이상이 필요해요.
          </p>
          <Link href="/chart/new" className="mt-4 inline-block">
            <Button>새 명반 만들기</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 palace-card rounded-2xl p-5 sm:p-6">
          <CompatibilityForm charts={charts} />
        </div>
      )}
    </main>
  );
}
