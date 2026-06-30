import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { hasPurchased } from "@/lib/purchase";
import { ReunionClient } from "./client";

export const metadata = { title: "재회운 분석 · 자미두수", robots: { index: false } };

export default async function ReunionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) redirect(`/chart/${id}`);

  const chart = await db.chart.findFirst({
    where: { id, userId },
    select: { id: true, subjectName: true, timeUncertain: true },
  });
  if (!chart) notFound();

  // 결제 게이트 — 미구매 시 결제 페이지로 이동
  const paid = await hasPurchased(userId, id);
  if (!paid) redirect(`/chart/${id}/pay?item=reunion`);

  return (
    <ReunionClient
      chartId={chart.id}
      subjectName={chart.subjectName ?? undefined}
      timeUncertain={chart.timeUncertain}
    />
  );
}
