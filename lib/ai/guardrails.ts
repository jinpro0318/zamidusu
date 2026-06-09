// 간단한 사용자 입력 가드레일. (실서비스에서는 더 정교한 분류기 사용 권장)
const FORBIDDEN_PATTERNS = [
  /자살|살인|폭력|마약/,
  /(주식|코인|투자).{0,10}(추천|종목|시점)/,
  /병명|진단|치료법/,
];

export function isSafeQuery(text: string): { ok: boolean; reason?: string } {
  if (!text.trim()) return { ok: false, reason: "빈 질문입니다." };
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(text)) {
      return {
        ok: false,
        reason: "이 주제는 자미두수 풀이로 답변하기 어렵습니다. 전문가와 상담해 주세요.",
      };
    }
  }
  return { ok: true };
}
