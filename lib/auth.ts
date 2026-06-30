// 회원가입/로그인 제거 — 게스트(zmds_guest 쿠키) 신원만 사용한다.
// 사주아이처럼 가입 없이 바로 쓰는 경험. 기존 페이지/라우트의 `auth()` 호출부
// 호환을 위해 동일 시그니처를 유지하되, 게스트 쿠키가 있으면 게스트 세션을,
// 없으면 null을 반환한다.
//
// 읽기 전용이라 Server Component에서도 안전(쿠키 set 하지 않음).
// 게스트 쿠키 발급은 명반 생성 시 getOrCreateGuestUserId가 담당한다.

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
  const id = await getGuestUserId();
  if (!id) return null;
  return { user: { id, email: null, name: "게스트", image: null } };
}
