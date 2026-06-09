import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// /mypage만 로그인 강제. /chart/*, /compatibility/*는 게스트 쿠키도 허용.
const LOGIN_REQUIRED = ["/mypage"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!LOGIN_REQUIRED.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Supabase Auth는 sb-*-auth-token 쿠키를 사용. 정확한 이름은 프로젝트 reference에 따라 다르므로
  // 패턴 매칭으로 확인.
  const hasSupabaseSession = req.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
  );

  if (!hasSupabaseSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/mypage/:path*"],
};
