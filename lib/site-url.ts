// lib/site-url.ts — 인증 리다이렉트용 사이트 origin / 콜백 URL 헬퍼.
//
// 핵심: 클라이언트(브라우저)에서는 항상 실제 window.location.origin 을 사용한다.
//   - 로컬 개발: http://localhost:3000
//   - 운영:      https://zamidusu.vercel.app
//   - 프리뷰:    https://<preview>.vercel.app
// 즉 환경에 따라 "자동으로" 올바른 도메인이 잡힌다. (하드코딩/localhost 고정 아님)
//
// 주의: 그래도 OAuth가 localhost로 가는 증상이라면 코드 문제가 아니라
//       Supabase 대시보드의 Site URL / Redirect URLs 허용목록 문제다(아래 문서 참고).

/** 현재 사이트 origin. 브라우저면 실제 origin, SSR이면 NEXT_PUBLIC_SITE_URL 폴백. */
export function getSiteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')) || 'http://localhost:3000';
}

/** Supabase OAuth/이메일 인증 후 돌아올 콜백 URL. callbackUrl은 인증 후 최종 이동할 내부 경로. */
export function authCallbackUrl(callbackUrl: string = '/mypage'): string {
  return `${getSiteOrigin()}/auth/callback?redirectTo=${encodeURIComponent(callbackUrl)}`;
}
