import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { DecadalTimeline } from "@/components/timeline/DecadalTimeline";
import { extractDecadals, currentDecadalAge } from "@/lib/iztro/horoscope";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "대운 타임라인" };

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload);
  const decadals = extractDecadals(payload);
  const age = currentDecadalAge(chart.birthYear);

  return (
    <main className="mx-auto max-w-md sm:max-w-3xl px-4 sm:px-6 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href={`/chart/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text"
        >
          <ChevronLeft className="size-4" /> 명반
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">大運</span>
      </header>

      <div className="mt-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
          대운 타임라인
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          10년 단위 대운의 흐름. 점을 탭하면 12궁이 펼쳐집니다.
        </p>
      </div>

      <div className="mt-6 sm:mt-8">
        <DecadalTimeline decadals={decadals} currentAge={age} />
      </div>

      <p className="mt-8 text-[11px] text-muted/80 leading-relaxed">
        ※ 점수는 길성·흉성·사화를 가중 합산한 추정치입니다.
        <br />
        절대적 길흉이 아니라 흐름의 강도 지표로 봐주세요.
      </p>
    </main>
  );
}
