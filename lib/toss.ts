// lib/toss.ts
// 토스페이먼츠 결제위젯(v2) 연동 공용 유틸.
//   - 클라이언트/서버 양쪽에서 import 가능한 순수 로직만 둔다(Node 전용 코드·시크릿 없음).
//   - 실제 승인(secretKey 사용) 호출은 서버 라우트(app/api/purchase/confirm)에서 직접 수행한다.

// 깊은풀이 단건 가격(원). Purchase.amount 기본값과 일치.
export const DEEP_PRICE = 890;

// 브라우저 결제위젯 초기화에 쓰는 공개 클라이언트 키.
// 키가 없으면(승인 대기 등) 결제 플로우를 노출하지 않는다.
export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";
export const isTossEnabled = TOSS_CLIENT_KEY.length > 0;

// 유료 기능 정의 — 궁합·인연 분석 + 재회운 두 가지만 운영.
export type PremiumItemKey = "compat" | "reunion";

export const PREMIUM_ITEMS: Record<
  PremiumItemKey,
  { orderName: string; path: (chartId: string) => string }
> = {
  compat:  { orderName: "자미두수 · 궁합·인연 분석", path: (id) => `/compatibility?from=${id}` },
  reunion: { orderName: "자미두수 · 재회운 분석",     path: (id) => `/chart/${id}/reunion` },
};

export function isPremiumItemKey(v: string | null | undefined): v is PremiumItemKey {
  return v === "compat" || v === "reunion";
}

// PremiumSection이 넘기는 내부 href → 유료 기능 키 역매핑.
export function itemFromHref(href: string): PremiumItemKey {
  if (href.includes("/compatibility")) return "compat";
  if (href.includes("/reunion")) return "reunion";
  return "reunion";
}

// 결제 주문번호 생성/파싱.
//   형식: zmds-{chartId}-{itemKey}-{rand}
//   chartId(cuid)·itemKey는 '-'를 포함하지 않으므로 안전하게 역파싱된다.
//   토스 주문번호 제약(6~64자, [A-Za-z0-9_-=]) 충족.
export function buildOrderId(chartId: string, itemKey: PremiumItemKey): string {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `zmds-${chartId}-${itemKey}-${rand}`;
}

export function parseOrderId(
  orderId: string,
): { chartId: string; itemKey: PremiumItemKey } | null {
  const m = /^zmds-([A-Za-z0-9]+)-(compat|reunion)-/.exec(orderId);
  if (!m) return null;
  return { chartId: m[1], itemKey: m[2] as PremiumItemKey };
}
