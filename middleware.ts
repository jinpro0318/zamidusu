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

    // 세션 확인 + 자동 갱신.
    // getClaims()는 내부적으로 getSession()을 거쳐 만료 임박 시 refresh token으로
    // access token을 재발급(setAll로 쿠키 갱신)하므로 자동로그인 유지는 동일하다.
    // 차이점: JWT Signing Keys(비대칭)가 켜져 있으면 토큰 검증을 네트워크 왕복 없이
    // 로컬(JWKS)에서 수행 → 매 네비게이션의 인증 지연이 사라진다.
    const { data } = await supabase.auth.getClaims();
    hasUser = !!data?.claims;
  }

  const { pathname } = req.nextUrl;
  if (LOGIN_REQUIRED.some((p) => pathname.startsWith(p)) && !hasUser) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  // 정적 자원과 /api를 제외한 모든 경로에서 실행.
  // - 페이지 네비게이션은 세션을 갱신(자동로그인 유지).
  // - /api는 각 라우트 핸들러가 자체적으로 auth()를 호출하므로 미들웨어 인증을
  //   중복으로 태울 필요가 없다 → API 호출(특히 AI 스트리밍)의 앞단 지연 제거.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
