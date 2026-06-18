import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeepReadingClient } from "./client";

export const metadata = { title: "12궁 전체 풀이" };

export default async function DeepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 테스트 기간: 로그인 회원이면 결제 없이 체험 가능(정식 전환 시 hasPurchased 게이트 복구).
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/chart/${id}/deep`)}`);
  }
  const userId = (session.user as any).id as string;

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  return <DeepReadingClient chartId={chart.id} subjectName={chart.subjectName ?? undefined} timeUncertain={chart.timeUncertain} />;
}
