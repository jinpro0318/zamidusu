import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MonthlyClient } from "./client";

export const metadata = { title: "월간 운세" };

export default async function MonthlyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 월간 운세 = 회원 전용. 비회원은 로그인 후 이 페이지로 복귀(결제 게이트는 정식 전환 시 복구).
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/chart/${id}/monthly`)}`);
  }
  const userId = (session.user as any).id as string;

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  return <MonthlyClient chartId={chart.id} subjectName={chart.subjectName ?? undefined} />;
}
