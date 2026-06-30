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
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) redirect(`/chart/${id}`);

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  let areas;
  try {
    const payload = JSON.parse(chart.payload) as AstrolabePayload;
    areas = toAreas(payload);
  } catch (err) {
    // 서버 컴포넌트 렌더 중 throw는 "This page couldn't load"로만 보이므로 원인을 로그로 남긴다.
    console.error("[GET /chart/[id]/palace] payload 파싱/변환 실패", {
      chartId: id,
      palaceKey: decodeURIComponent(key),
      iztroVersion: chart.iztroVersion,
      err,
    });
    throw err;
  }
  return (
    <DetailClient
      areas={areas}
      palaceKey={decodeURIComponent(key)}
      chartId={chart.id}
      loggedIn={true}
      timeUncertain={chart.timeUncertain}
    />
  );
}
