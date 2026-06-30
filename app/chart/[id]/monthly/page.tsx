import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { MonthlyClient } from "./client";

export const metadata = { title: "월간 운세" };

export default async function MonthlyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) redirect(`/chart/${id}`);

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  return <MonthlyClient chartId={chart.id} subjectName={chart.subjectName ?? undefined} />;
}
