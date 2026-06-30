import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { adoptGuestData } from "@/lib/guest";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const origin = url.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const u = data.user;
      // Prisma User upsert — 첫 로그인 시 생성, 이후 이름·이미지 업데이트
      await db.user.upsert({
        where: { id: u.id },
        create: {
          id: u.id,
          email: u.email ?? `${u.id}@kakao.local`,
          name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? "사용자",
          image: u.user_metadata?.avatar_url ?? null,
        },
        update: {
          email: u.email ?? undefined,
          name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? undefined,
          image: u.user_metadata?.avatar_url ?? undefined,
        },
      }).catch((e) => console.error("[auth/callback] user upsert 실패", e));

      // 게스트로 만든 명반 등을 로그인 계정으로 이관
      await adoptGuestData(u.id).catch((e) =>
        console.error("[auth/callback] adoptGuestData 실패", e),
      );
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
