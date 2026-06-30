import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { DEEP_PRICE, isPremiumItemKey, isTossEnabled, PREMIUM_ITEMS, TOSS_CLIENT_KEY } from "@/lib/toss";
import { PayClient } from "./client";

export const metadata = { title: "결제 · 자미두수", robots: { index: false } };

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { id } = await params;
  const { item } = await searchParams;

  // 토스 키가 없으면(승인 대기 등) 결제 화면을 노출하지 않고 결과로 돌려보낸다.
  if (!isTossEnabled) redirect(`/chart/${id}`);
  if (!isPremiumItemKey(item)) redirect(`/chart/${id}`);

  // 본인 명반 확인(게스트 포함).
  const session = await auth();
  const userId = session?.user ? ((session.user as any).id as string) : await getGuestUserId();
  if (!userId) redirect(`/chart/${id}`);

  const chart = await db.chart.findFirst({
    where: { id, userId },
    select: { id: true, subjectName: true },
  });
  if (!chart) notFound();

  const spec = PREMIUM_ITEMS[item];

  return (
    <PayClient
      chartId={chart.id}
      itemKey={item}
      clientKey={TOSS_CLIENT_KEY}
      orderName={spec.orderName}
      amount={DEEP_PRICE}
      customerName={chart.subjectName ?? "고객"}
    />
  );
}
