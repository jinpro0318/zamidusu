import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { toAreas } from "@/lib/iztro/to-areas";
import { DetailClient } from "./client";
import type { AstrolabePayload } from "@/lib/iztro/types";

export const metadata = { title: "궁 상세" };

export default async function PalaceDetailPage({
  params,
}: {
  params: Promise<{ id: string; key: string }>;
}) {
  const { id, key } = await params;
  const session = await auth();
  // 궁 상세는 회원 전용 — 게스트는 로그인 후 이 페이지로 복귀
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/chart/${id}/palace/${key}`)}`);
  }
  const userId = (session.user as any).id as string;

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload) as AstrolabePayload;
  const areas = toAreas(payload);
  return (
    <DetailClient
      areas={areas}
      palaceKey={decodeURIComponent(key)}
      chartId={chart.id}
      loggedIn={!!session?.user}
    />
  );
}
