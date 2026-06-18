import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPurchased } from "@/lib/purchase";
import { DeepReadingClient } from "./client";

export const metadata = { title: "깊은 풀이" };

export default async function DeepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 깊은풀이 = 로그인 + 결제(PAID) 전용. 데이터 렌더 전 서버에서 차단.
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/chart/${id}/deep`)}`);
  }
  const userId = (session.user as any).id as string;

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  if (!(await hasPurchased(userId, chart.id))) {
    redirect(`/chart/${id}`);
  }

  return <DeepReadingClient chartId={chart.id} subjectName={chart.subjectName ?? undefined} />;
}
