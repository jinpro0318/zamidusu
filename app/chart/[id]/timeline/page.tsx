import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DecadalTimelineLazy } from "@/components/timeline/DecadalTimelineLazy";
import { TimelineAnalysis } from "@/components/timeline/TimelineAnalysis";
import { extractDecadals, currentDecadalAge } from "@/lib/iztro/horoscope";
import { ChevronLeft } from "lucide-react";
import { Z } from "@/theme/tokens";

export const metadata = { title: "대운 타임라인" };

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // 대운 타임라인은 회원 전용 — 게스트는 로그인 후 이 페이지로 복귀
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/chart/${id}/timeline`)}`);
  }
  const userId = (session.user as any).id as string;

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload);
  const decadals = extractDecadals(payload);
  const age = currentDecadalAge(chart.birthYear);

  return (
    <main
      style={{ minHeight: "100%", background: Z.cream }}
      className="mx-auto w-full max-w-[480px] px-4 pb-16 safe-bottom"
    >
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href={`/chart/${id}`}
          className="inline-flex items-center gap-1 text-sm"
          style={{ color: Z.ink2 }}
        >
          <ChevronLeft className="size-4" /> 명반
        </Link>
        <span className="font-display text-sm tracking-wider" style={{ color: Z.p600, fontWeight: 700 }}>大運</span>
      </header>

      <div className="mt-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight" style={{ color: Z.ink }}>
          대운·세운 타임라인
        </h1>
        <p className="mt-2 text-xs sm:text-sm" style={{ color: Z.ink2 }}>
          10년 단위 대운의 흐름. 점을 탭하면 12궁이 펼쳐집니다.
        </p>
      </div>

      <div className="mt-6 sm:mt-8">
        <DecadalTimelineLazy decadals={decadals} currentAge={age} />
      </div>

      <p className="mt-8 text-[11px] leading-relaxed" style={{ color: Z.ink3 }}>
        ※ 점수는 길성·흉성·사화를 가중 합산한 추정치입니다.
        <br />
        절대적 길흉이 아니라 흐름의 강도 지표로 봐주세요.
      </p>

      {/* 연령대별 흐름 분석 (AI) — 시기별 흐름 전용 */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold" style={{ color: Z.p600 }}>연령대별 흐름 분석</h2>
        <p className="mt-1 mb-4 text-xs" style={{ color: Z.ink2 }}>대운 구간마다 그 시기의 운 흐름을 짚어드려요.</p>
        <TimelineAnalysis chartId={id} />
      </section>
    </main>
  );
}
