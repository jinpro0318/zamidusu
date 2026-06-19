// 인앱(임베디드) 브라우저 감지 + 외부 브라우저로 열기.
//
// 배경: 카카오톡·인스타·페북·라인 등 앱 안의 웹뷰에서는 Google OAuth가
// "Use secure browsers" 정책으로 차단된다(Error 403: disallowed_useragent).
// → 구글 로그인 직전에 인앱 브라우저를 감지해, 가능한 경우 외부 브라우저(Safari/Chrome)로
//   현재 URL을 다시 열어주고, 스킴이 없는 앱은 안내 메시지로 유도한다.
// (이메일/비밀번호 로그인은 인앱에서도 동작하므로 구글 버튼에만 적용)

export type InAppBrowser =
  | "kakaotalk"
  | "line"
  | "instagram"
  | "facebook"
  | "naver"
  | "other"
  | null;

/** userAgent로 인앱 브라우저 종류를 판별. 일반 Safari/Chrome이면 null. */
export function detectInAppBrowser(ua?: string): InAppBrowser {
  const s = (ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")).toLowerCase();
  if (!s) return null;
  if (s.includes("kakaotalk")) return "kakaotalk";
  if (/\bline\//.test(s) || s.includes("line/")) return "line";
  if (s.includes("instagram")) return "instagram";
  if (s.includes("fban") || s.includes("fbav") || s.includes("fb_iab")) return "facebook";
  if (s.includes("naver(inapp") || s.includes("naver ") || s.includes("naverapp")) return "naver";
  // 그 외 일반 인앱 웹뷰 신호: Android WebChrome(wv) 등은 오탐 위험이 커서 제외.
  return null;
}

export function isInAppBrowser(ua?: string): boolean {
  return detectInAppBrowser(ua) !== null;
}

/**
 * 인앱 브라우저에서 외부 브라우저로 targetUrl을 다시 연다.
 * - 카카오톡/라인: 전용 스킴/쿼리로 외부 브라우저 자동 오픈 → true
 * - 그 외(인스타·페북 등): 신뢰할 스킴이 없어 호출부가 안내해야 함 → false
 */
export function openInExternalBrowser(targetUrl: string): boolean {
  if (typeof window === "undefined") return false;
  const type = detectInAppBrowser();
  if (type === "kakaotalk") {
    // 카카오톡: 외부 브라우저로 열기 스킴
    window.location.href = "kakaotalk://web/openExternal?url=" + encodeURIComponent(targetUrl);
    return true;
  }
  if (type === "line") {
    // 라인: openExternalBrowser=1 쿼리를 붙이면 외부 브라우저로 전환
    try {
      const u = new URL(targetUrl);
      u.searchParams.set("openExternalBrowser", "1");
      window.location.href = u.toString();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/** 인앱 브라우저 안내 문구(스킴 자동전환이 안 되는 앱용). */
export const INAPP_GUIDE_MESSAGE =
  "인앱 브라우저에서는 구글 로그인이 막혀요. 우측 상단 메뉴(⋯)에서 ‘다른 브라우저로 열기’(Safari·Chrome)를 누른 뒤 다시 시도해 주세요.";
