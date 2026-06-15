import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// /mypage만 로그인 강제. /chart/*, /compatibility/*는 게스트 쿠키도 허용.
const LOGIN_REQUIRED = ["/mypage"];

// 모든 요청에서 Supabase 세션을 자동 갱신한다.
// - access token은 수명이 짧음(기본 1h). 만료 직전 refresh token으로 재발급하고
//   httpOnly 쿠키에 다시 기록해야 자동로그인이 유지됨.
// - Server Component에서는 쿠키 set이 불가능하므로(읽기 전용), 미들웨어가
//   매 네비게이션마다 getUser()를 호출해 토큰을 갱신·기록하는 것이 표준 패턴.
//   → 사용자가 명시적으로 로그아웃하기 전까지 세션이 풀리지 않음.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let hasUser = false;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(items) {
          // 1) 다운스트림(RSC)이 같은 요청에서 갱신된 토큰을 읽도록 request에도 반영
          items.forEach(({ name, value }) => req.cookies.set(name, value));
          // 2) 브라우저에 갱신된 httpOnly 쿠키를 내려보내도록 response에 기록
          res = NextResponse.next({ request: req });
          items.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });

    // 세션 자동 갱신 트리거 (필요 시 refresh token으로 access token 재발급).
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasUser = !!user;
  }

  const { pathname } = req.nextUrl;
  if (LOGIN_REQUIRED.some((p) => pathname.startsWith(p)) && !hasUser) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  // 정적 자원을 제외한 모든 경로에서 실행 → 어느 페이지를 방문하든 세션이 갱신됨.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
