import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { DEEP_PRICE, parseOrderId, PREMIUM_ITEMS } from "@/lib/toss";

export const runtime = "nodejs";

// 토스페이먼츠 결제위젯 successUrl 콜백.
//   결제창에서 결제 완료 → 토스가 paymentKey·orderId·amount를 붙여 이 경로로 redirect.
//   여기서 secretKey로 최종 승인(confirm)을 호출해야 실제 결제가 확정된다.
//   승인 성공 시 Purchase를 PAID로 기록하고 원래 보려던 유료 콘텐츠로 보낸다.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = Number(url.searchParams.get("amount"));

  const fail = (chartId?: string) =>
    NextResponse.redirect(
      new URL(chartId ? `/chart/${chartId}?pay=fail` : "/?pay=fail", url.origin),
    );

  if (!paymentKey || !orderId || !Number.isFinite(amount)) return fail();

  const parsed = parseOrderId(orderId);
  if (!parsed) return fail();
  const { chartId, itemKey } = parsed;

  // 금액 위·변조 방지 — 서버가 기대하는 가격과 일치해야 함.
  if (amount !== DEEP_PRICE) return fail(chartId);

  // 결제 주체 식별 — 로그인 회원은 세션 ID, 비로그인은 게스트 쿠키.
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) return fail(chartId);

  const chart = await db.chart.findFirst({
    where: { id: chartId, userId },
    select: { id: true },
  });
  if (!chart) return fail(chartId);

  // 토스 최종 승인 (secretKey 필요).
  const secret = process.env.TOSS_PAYMENTS_SECRET_KEY;
  if (!secret) {
    console.error("[purchase/confirm] TOSS_PAYMENTS_SECRET_KEY 미설정");
    return fail(chartId);
  }

  try {
    const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      console.error("[purchase/confirm] 토스 승인 실패", res.status, errBody?.code, errBody?.message);
      return fail(chartId);
    }

    // 결제 확정 — Purchase를 PAID로 기록(중복 결제는 upsert로 흡수).
    await db.purchase.upsert({
      where: { userId_chartId: { userId, chartId } },
      create: {
        userId,
        chartId,
        amount: DEEP_PRICE,
        method: "TOSS",
        status: "PAID",
        depositorName: orderId, // 결제 대조용 주문번호 기록
      },
      update: { status: "PAID", method: "TOSS", depositorName: orderId },
    });
  } catch (err) {
    console.error("[purchase/confirm] 처리 실패", err);
    return fail(chartId);
  }

  // 결제한 유료 콘텐츠로 이동.
  return NextResponse.redirect(new URL(PREMIUM_ITEMS[itemKey].path(chartId), url.origin));
}
