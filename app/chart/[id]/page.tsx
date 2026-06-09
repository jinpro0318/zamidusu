import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { ChartGrid } from "@/components/chart/ChartGrid";
import { ChartHeader } from "@/components/chart/ChartHeader";
import { ShareButton } from "@/components/share/ShareButton";
import { Bot, Clock, Users, ChevronLeft } from "lucide-react";
import type { AstrolabePayload } from "@/lib/iztro/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = await db.chart.findUnique({ where: { id } });
  if (!chart) return {};
  return {
    title: `${chart.subjectName ?? "나의 명반"} · 자미두수`,
    openGraph: { images: [`/api/og/chart/${id}`] },
  };
}

export default async function ChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload) as AstrolabePayload;
  const isGuest = userId.startsWith("guest_");

  return (
    <main className="mx-auto max-w-md sm:max-w-4xl px-3 sm:px-6 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href={isGuest ? "/" : "/mypage"}
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text"
        >
          <ChevronLeft className="size-4" /> {isGuest ? "홈" : "목록"}
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">紫微</span>
      </header>

      <div className="mt-2 flex flex-col gap-3">
        <ChartHeader payload={payload} subjectName={chart.subjectName} gender={chart.gender} />
        <ShareButton
          chartId={chart.id}
          shareToken={chart.shareToken}
          title={chart.subjectName ?? "나의 명반"}
        />
      </div>

      {/* 액션 — 모바일은 가로 스크롤 칩 형태 */}
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
        <ActionChip href={`/chart/${id}/ai`} icon={<Bot className="size-3.5" />} label="AI 해석" />
        <ActionChip href={`/chart/${id}/timeline`} icon={<Clock className="size-3.5" />} label="대운 타임라인" />
        <ActionChip href="/compatibility" icon={<Users className="size-3.5" />} label="궁합 보기" />
      </nav>

      <div className="mt-6">
        <ChartGrid payload={payload} />
      </div>

      <footer className="mt-10 text-[11px] text-muted/80 leading-relaxed">
        ※ iztro 오픈소스 엔진 기반 계산.
        <br />
        일부 학파와 해석이 다를 수 있습니다.
      </footer>
    </main>
  );
}

function ActionChip({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs text-foreground hover:border-gold/60 hover:bg-gold/10 transition"
    >
      <span className="gold-text">{icon}</span>
      {label}
    </Link>
  );
}
