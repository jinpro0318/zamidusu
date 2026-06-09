import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ChartGrid } from "@/components/chart/ChartGrid";
import { ChartHeader } from "@/components/chart/ChartHeader";
import { Button } from "@/components/ui/button";
import type { AstrolabePayload } from "@/lib/iztro/types";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const chart = await db.chart.findFirst({
    where: { shareToken: token, shareEnabled: true },
  });
  if (!chart) return {};
  return {
    title: `${chart.subjectName ?? "공유 명반"} · 자미두수`,
    description: "자미두수 명반과 12궁 풀이를 확인해보세요.",
    openGraph: { images: [`/api/og/chart/${token}`] },
  };
}

export default async function SharedChartPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const chart = await db.chart.findFirst({
    where: { shareToken: token, shareEnabled: true },
  });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload) as AstrolabePayload;

  return (
    <main className="mx-auto max-w-md sm:max-w-4xl px-3 sm:px-6 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link href="/" className="font-display text-lg font-bold gold-text">
          紫微
        </Link>
        <Link href="/chart/new">
          <Button variant="outline" size="sm">
            내 명반 만들기
          </Button>
        </Link>
      </header>

      <div className="mt-2 px-1 sm:px-0">
        <ChartHeader payload={payload} subjectName={chart.subjectName} gender={chart.gender} />
      </div>

      <div className="mt-6">
        <ChartGrid payload={payload} />
      </div>

      <div className="mt-10 palace-card rounded-2xl p-6 text-center">
        <p className="font-display text-xs gold-text tracking-[0.4em]">YOUR TURN</p>
        <h2 className="mt-2 font-display text-xl font-bold">나도 명반 만들어보기</h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          출생 시간만 입력하면
          <br />
          1초 만에 12궁이 완성됩니다.
        </p>
        <Link href="/chart/new" className="mt-5 inline-block">
          <Button size="lg" className="font-display">
            무료로 시작하기 →
          </Button>
        </Link>
      </div>
    </main>
  );
}
