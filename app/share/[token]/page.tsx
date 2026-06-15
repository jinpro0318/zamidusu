import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ChartGrid } from "@/components/chart/ChartGrid";
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
    <main className="mx-auto w-full max-w-[480px] px-4 pb-20 safe-bottom min-h-dvh">
      <header className="flex items-center justify-between py-5 safe-top">
        <Link href="/" className="font-display text-base gold-text tracking-[0.3em]">紫微</Link>
        <Link
          href="/chart/new"
          className="text-[11px] tracking-[0.2em] border border-gold/30 hover:border-gold/60 px-3 py-1.5 rounded-md gold-text hover:bg-gold/10 transition"
        >
          MAKE MINE
        </Link>
      </header>

      <section className="mt-4 text-center">
        <p className="font-display text-6xl gold-text leading-none">命</p>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
          {chart.subjectName ?? "공유 명반"}
        </h1>
        <p className="mt-2 text-[11px] text-muted tracking-wider">
          {chart.gender === "MALE" ? "男" : "女"} · {payload.solarDate} · {payload.time}
        </p>
      </section>

      <div className="dotted-divider mt-6 mb-6" />

      <ChartGrid payload={payload} />

      <div className="mt-12 text-center">
        <p className="font-display text-xs gold-text tracking-[0.4em]">YOUR TURN</p>
        <h2 className="mt-3 font-display text-xl font-bold">나도 명반 만들어보기</h2>
        <p className="mt-2 text-xs text-muted">
          출생 시간만 입력하면 1초 만에 12궁이 완성됩니다.
        </p>
        <Link href="/chart/new" className="mt-5 inline-block">
          <button className="px-6 py-3 rounded-lg font-display text-sm tracking-[0.2em] bg-gold text-[#15102a] hover:bg-[#f0d98a] transition">
            무료로 시작하기
          </button>
        </Link>
      </div>
    </main>
  );
}
