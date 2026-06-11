// API 라우트 공용 에러 → 안전한 응답 본문 변환.
// 내부 메시지/스택트레이스는 절대 포함하지 않는다 — 그건 console.error 몫.

export const GENERIC_500 = "처리에 실패했어요. 잠시 후 다시 시도해 주세요.";

// Prisma 알려진 에러 코드를 사용자 친화적 한글로 매핑.
// 참고: https://www.prisma.io/docs/orm/reference/error-reference
// 매핑 안 된 코드 / 다른 종류 에러는 fallback 메시지를 사용해 내부 메시지 노출을 방지한다.
export const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2002: "이미 등록된 정보예요.",
  P2003: "참조한 항목을 찾을 수 없어요.",
  P2025: "해당 항목을 찾을 수 없어요.",
  P1001: "데이터베이스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
  P1002: "데이터베이스 응답이 지연되고 있어요.",
  P1008: "요청 처리가 너무 오래 걸려요. 잠시 후 다시 시도해 주세요.",
  P1017: "데이터베이스 연결이 끊겼어요. 잠시 후 다시 시도해 주세요.",
};

export function safeErrorBody(err: unknown, fallback: string = GENERIC_500): { error: string } {
  const code = (err as { code?: unknown })?.code;
  if (typeof code === "string" && code in PRISMA_ERROR_MESSAGES) {
    return { error: PRISMA_ERROR_MESSAGES[code] };
  }
  return { error: fallback };
}
