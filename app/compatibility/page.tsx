import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { CompatibilityForm } from "./form";

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
          id: true, subjectName: true,
          birthYear: true, birthMonth: true, birthDay: true,
          gender: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto max-w-md px-5 pb-16 safe-bottom min-h-dvh">
      <header className="flex items-center justify-between py-5 safe-top">
        <Link href="/" className="text-[11px] text-muted hover:gold-text tracking-[0.2em] transition">
          ← HOME
        </Link>
        <span className="font-display text-sm gold-text tracking-[0.3em]">紫微</span>
      </header>

      <div className="mt-6 text-center">
        <p className="font-display text-7xl gold-text leading-none">合</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="block h-px w-8 bg-gold/40" />
          <p className="font-display text-base tracking-[0.4em] gold-text">合婚</p>
          <span className="block h-px w-8 bg-gold/40" />
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight">
          자미두수 궁합
        </h1>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          두 명반의 12궁·사화·오행국을 종합 비교
        </p>
      </div>

      {charts.length < 2 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">
            궁합을 보려면 명반 2개 이상이 필요해요.
          </p>
          <Link href="/chart/new" className="mt-5 inline-block">
            <button className="px-6 py-3 rounded-lg font-display text-sm tracking-[0.2em] bg-gold text-[#15102a] hover:bg-[#f0d98a] transition">
              새 명반 만들기
            </button>
          </Link>
        </div>
      ) : (
        <div className="mt-10">
          <CompatibilityForm charts={charts} />
        </div>
      )}
    </main>
  );
}
