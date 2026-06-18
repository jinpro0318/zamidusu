import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
  // 궁별 상세풀이 = 로그인(회원) 전용. 비회원/게스트는 로그인 유도(결제 불필요).
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/chart/${id}/palace/${key}`)}`);
  }
  const userId = (session.user as any).id as string;

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
