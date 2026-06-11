import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth";
import { adoptGuestData } from "@/lib/guest";

// Supabase OAuth (Kakao 등) 콜백 — code를 세션으로 교환.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirectTo") ?? "/mypage";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=no_code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/sign-in?error=supabase_not_configured", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // 게스트로 만든 명반·대화를 방금 로그인한 계정으로 인계.
  // 인계 실패가 로그인 자체를 막아서는 안 되므로 에러는 로그만 남긴다.
  try {
    const session = await auth(); // Prisma User upsert 포함
    if (session?.user) await adoptGuestData(session.user.id);
  } catch (err) {
    console.error("[GET /auth/callback] 게스트 데이터 인계 실패", err);
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
