// Supabase Auth 기반. 기존 NextAuth 호환 API를 유지해
// 페이지/라우트 코드의 `auth()` 호출을 그대로 사용 가능.
//
// 흐름:
//   1) Supabase에서 인증된 user 확인
//   2) 첫 로그인이면 우리 Prisma DB의 User에 sync (cuid = supabase user.id)
//   3) 같은 형태의 { user: { id, email, name } } 반환

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

// 핫 패스(모든 페이지·API). getClaims()는 JWT를 로컬 검증한다.
// - Supabase JWT Signing Keys(비대칭)가 켜져 있으면 네트워크 왕복 없이 JWKS로 검증 → 매우 빠름.
// - 켜져 있지 않으면 내부적으로 getUser()로 폴백(동작은 동일, 속도만 차이).
// DB user 동기화(upsert)는 여기서 하지 않는다 → 로그인 시 ensureUser()가 1회 수행.
export async function auth(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, any> | undefined;
  if (error || !claims?.sub || !claims?.email) return null;

  const meta = (claims.user_metadata ?? {}) as Record<string, any>;
  return {
    user: {
      id: claims.sub as string,
      email: claims.email as string,
      name: meta.name ?? meta.full_name ?? null,
      image: meta.avatar_url ?? null,
    },
  };
}

// 로그인 완료 시점(OAuth 콜백 등)에 1회만 호출 — Supabase user를 Prisma User에 동기화.
// 매 요청마다 하던 upsert를 이 지점으로 옮겨 핫 패스에서 DB 쓰기를 제거한다.
export async function ensureUser(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return null;

  // Prisma User와 동기화 — 비즈니스 데이터는 우리 DB에 두고 user.id로 외래키 연결.
  await db.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
      image: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
      image: user.user_metadata?.avatar_url ?? null,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? null,
      image: user.user_metadata?.avatar_url ?? null,
    },
  };
}

// Server Action용 sign-out 헬퍼
export async function signOut(_opts?: { redirectTo?: string }) {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  // 이전 NextAuth API에서 redirectTo를 받았으므로 호출부 호환 유지
  const { redirect } = await import("next/navigation");
  redirect(_opts?.redirectTo ?? "/");
}
