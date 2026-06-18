import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPurchased } from "@/lib/purchase";
import { getGuestUserId } from "@/lib/guest";
import { toAreas } from "@/lib/iztro/to-areas";
import { ResultClient } from "./client";
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
  const loggedIn = !!session?.user;
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload) as AstrolabePayload;
  const areas = toAreas(payload);
  const birthLabel = `${chart.birthYear}.${String(chart.birthMonth).padStart(2, "0")}.${String(chart.birthDay).padStart(2, "0")} · ${chart.birthCalendar === "SOLAR" ? "양력" : "음력"} · ${payload.time} · ${chart.gender === "MALE" ? "男" : "女"}`;

  // 깊은풀이 결제 여부(로그인 시만 조회) + 무통장입금 계좌(서버 env, 하드코딩 금지).
  const isPaid = loggedIn ? await hasPurchased(userId, chart.id) : false;
  const bank = {
    name: process.env.BANK_NAME ?? "",
    account: process.env.BANK_ACCOUNT ?? "",
    holder: process.env.BANK_HOLDER ?? "",
  };

  return (
    <ResultClient
      areas={areas}
      subjectName={chart.subjectName ?? undefined}
      birthLabel={birthLabel}
      chartId={chart.id}
      loggedIn={loggedIn}
      isPaid={isPaid}
      bank={bank}
    />
  );
}
