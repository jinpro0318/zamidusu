import { db } from "@/lib/db";

// 상세풀이 접근 권한 판정의 단일 출처(서버 전용).
// chart 1개 = "12궁 전체 상세풀이"를 단건 구매(Purchase)로 잠금해제하며,
// 무통장입금은 관리자가 입금확인하면 status가 PENDING→PAID로 바뀐다.
// 추후 구독(entitlements.premiumUnlock) 우회나 PG 전환 시 이 함수만 확장한다.
export async function hasPurchased(userId: string, chartId: string): Promise<boolean> {
  if (!userId || !chartId) return false;
  const p = await db.purchase.findUnique({
    where: { userId_chartId: { userId, chartId } },
    select: { status: true },
  });
  return p?.status === "PAID";
}
