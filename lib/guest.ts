import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

const GUEST_COOKIE = "zmds_guest";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

// 비로그인 사용자를 위한 익명 user를 cookie 기반으로 식별.
// 동일 브라우저에서 만든 명반은 게스트 user에 귀속.
export async function getOrCreateGuestUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;

  if (existing) {
    const user = await db.user.findUnique({ where: { id: existing } });
    if (user) return user.id;
  }

  const id = `guest_${nanoid(16)}`;
  await db.user.create({
    data: {
      id,
      email: `${id}@guest.zamidusu.local`,
      name: "게스트",
    },
  });

  store.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return id;
}

export async function getGuestUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value ?? null;
}
