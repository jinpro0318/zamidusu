// 인증 유틸 — Supabase Auth 세션 우선, 없으면 게스트 쿠키로 폴백.
// Supabase OAuth(카카오 등) 로그인 시 실제 user.id를 반환하고,
// 비로그인 게스트는 zmds_guest 쿠키 기반 ID를 반환한다.

import { createClient } from "@/lib/supabase/server";
import { getGuestUserId } from "@/lib/guest";

export interface AuthSession {
  user: {
    id: string;
    email: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export async function auth(): Promise<AuthSession | null> {
  // 1) Supabase 세션 확인
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return {
        user: {
          id: user.id,
          email: user.email ?? null,
          name:
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            null,
          image: user.user_metadata?.avatar_url ?? null,
        },
      };
    }
  } catch {
    // 서버 컴포넌트 read-only context 등에서 쿠키 set 실패해도 무시
  }

  // 2) 게스트 쿠키 폴백
  const id = await getGuestUserId();
  if (!id) return null;
  return { user: { id, email: null, name: "게스트", image: null } };
}
