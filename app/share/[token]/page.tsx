import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ChartGrid } from "@/components/chart/ChartGrid";
import { SoulHero } from "@/components/chart/SoulHero";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
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
    <main className="mx-auto max-w-md sm:max-w-4xl px-3 sm:px-6 pb-20 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link href="/" className="font-display text-lg font-bold gold-text">
          紫微
        </Link>
        <Link href="/chart/new">
          <Button variant="outline" size="sm">
            <Sparkles className="size-3.5" /> 내 명반 만들기
          </Button>
        </Link>
      </header>

      <section className="mt-2 text-center sm:text-left">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">
          {chart.subjectName ?? "공유 명반"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          {chart.gender === "MALE" ? "남" : "여"} · {payload.solarDate} · {payload.time}
        </p>
      </section>

      <div className="mt-6">
        <SoulHero payload={payload} />
      </div>

      <div className="mt-8">
        <ChartGrid payload={payload} />
      </div>

      <div className="mt-12 palace-card rounded-2xl p-6 text-center">
        <p className="font-display text-xs gold-text tracking-[0.4em]">YOUR TURN</p>
        <h2 className="mt-2 font-display text-xl font-bold">나도 명반 만들어보기</h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          출생 시간만 입력하면
          <br />
          1초 만에 12궁이 완성됩니다.
        </p>
        <Link href="/chart/new" className="mt-5 inline-block">
          <Button size="lg" className="font-display">
            <Sparkles className="size-4" /> 무료로 시작하기
          </Button>
        </Link>
      </div>
    </main>
  );
}
