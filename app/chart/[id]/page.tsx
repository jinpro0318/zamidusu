import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { ChartGrid } from "@/components/chart/ChartGrid";
import { SoulHero } from "@/components/chart/SoulHero";
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
    <main className="mx-auto max-w-md sm:max-w-4xl px-3 sm:px-6 pb-20 safe-bottom">
      {/* 1. 상단 네비 */}
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href={isGuest ? "/" : "/mypage"}
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text transition"
        >
          <ChevronLeft className="size-4" /> {isGuest ? "홈" : "목록"}
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">紫微</span>
        <ShareButton
          chartId={chart.id}
          shareToken={chart.shareToken}
          title={chart.subjectName ?? "나의 명반"}
        />
      </header>

      {/* 2. 본명·생일 요약 */}
      <section className="mt-2 text-center sm:text-left">
        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
          {chart.subjectName ?? "나의 명반"}
        </h1>
        <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-1.5 text-[11px]">
          <Pill>{chart.gender === "MALE" ? "남" : "여"}</Pill>
          {payload.zodiac && <Pill>{payload.zodiac}</Pill>}
          <Pill>{payload.solarDate}</Pill>
          <Pill>음 {payload.lunarDate}</Pill>
          <Pill>{payload.time}</Pill>
        </div>
      </section>

      {/* 3. 액션 chips — 모바일 가로 스크롤 */}
      <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
        <ActionChip href={`/chart/${id}/ai`} icon={<Bot className="size-3.5" />} label="AI 해석" accent />
        <ActionChip href={`/chart/${id}/timeline`} icon={<Clock className="size-3.5" />} label="대운 타임라인" />
        <ActionChip href="/compatibility" icon={<Users className="size-3.5" />} label="궁합 보기" />
      </nav>

      {/* 4. 명궁 히어로 */}
      <div className="mt-6">
        <SoulHero payload={payload} />
      </div>

      {/* 5. 12궁 그리드 + 선택 디테일 */}
      <div className="mt-8">
        <ChartGrid payload={payload} />
      </div>

      <footer className="mt-12 text-center text-[11px] text-muted/80 leading-relaxed">
        ※ iztro 오픈소스 엔진 기반 계산.
        <br />
        일부 학파와 해석이 다를 수 있습니다.
      </footer>
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-foreground/80">
      {children}
    </span>
  );
}

function ActionChip({
  href,
  icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition active:scale-95 " +
        (accent
          ? "border-gold/60 bg-gold/10 text-gold hover:bg-gold/20"
          : "border-white/15 bg-white/5 text-foreground/85 hover:border-gold/40")
      }
    >
      {icon}
      {label}
    </Link>
  );
}
