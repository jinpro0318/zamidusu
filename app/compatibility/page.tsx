import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompatibilityForm } from "./form";

export const metadata = { title: "자미두수 궁합" };

export default async function CompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  // 출처 명반 id(궁합 진입 전 보던 명반) — 뒤로가기(← HOME) 복귀에 사용. 내부 id 형식만 허용.
  const fromChartId = typeof from === "string" && /^[a-zA-Z0-9_-]+$/.test(from) ? from : undefined;

  const session = await auth();
  // 회원 전용 — 게스트는 로그인 후 이 페이지(출처 포함)로 복귀
  if (!session?.user) {
    const next = fromChartId ? `/compatibility?from=${fromChartId}` : "/compatibility";
    redirect('/chart/new');
  }
  const userId = (session.user as any).id as string;

  // 저장 명반 목록(직접 입력도 가능하므로 0~1개여도 폼을 노출).
  const charts = await db.chart.findMany({
    where: { userId },
    select: {
      id: true, subjectName: true,
      birthYear: true, birthMonth: true, birthDay: true,
      gender: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 라이트 테마·헤더·레이아웃은 CompatibilityForm이 담당.
  return <CompatibilityForm charts={charts} fromChartId={fromChartId} />;
}
