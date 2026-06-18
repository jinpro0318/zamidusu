import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { safeErrorBody } from "@/lib/errors";

export const runtime = "nodejs";

// 깊은풀이 단건 구매 — 무통장입금 신청.
// 클라이언트는 status를 정할 수 없고 항상 PENDING(입금대기)으로만 생성/갱신된다.
// 실제 입금확인(PENDING→PAID)은 관리자만 수행(별도).
const DEEP_PRICE = 890;

const InputSchema = z.object({
  chartId: z.string().min(1),
  depositorName: z.string().trim().min(1).max(40),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바른 JSON이 아닙니다." }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입금자명을 입력해 주세요." }, { status: 400 });
  }
  const { chartId, depositorName } = parsed.data;

  try {
    // 결제는 회원 전용(게스트 불가) — 구매를 계정에 귀속.
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    // 본인 소유 명반인지 확인.
    const chart = await db.chart.findFirst({ where: { id: chartId, userId }, select: { id: true } });
    if (!chart) {
      return NextResponse.json({ error: "명반을 찾을 수 없어요." }, { status: 404 });
    }

    // 이미 결제 완료면 그대로 둔다(중복 신청 무시).
    const existing = await db.purchase.findUnique({
      where: { userId_chartId: { userId, chartId } },
      select: { status: true },
    });
    if (existing?.status === "PAID") {
      return NextResponse.json({ status: "PAID", alreadyPaid: true });
    }

    // 무통장입금 신청 — 항상 PENDING. (status는 클라이언트가 정하지 못함)
    await db.purchase.upsert({
      where: { userId_chartId: { userId, chartId } },
      create: {
        userId,
        chartId,
        amount: DEEP_PRICE,
        method: "BANK_TRANSFER",
        status: "PENDING",
        depositorName,
      },
      update: { depositorName, status: "PENDING" },
    });

    return NextResponse.json({ status: "PENDING" }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/purchase] 처리 실패", err);
    return NextResponse.json(
      safeErrorBody(err, "신청 처리에 실패했어요. 잠시 후 다시 시도해 주세요."),
      { status: 500 },
    );
  }
}
