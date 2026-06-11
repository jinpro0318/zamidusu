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
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return id;
}

export async function getGuestUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value ?? null;
}

// 로그인 직후 게스트 데이터(명반·AI 대화·궁합)를 회원 계정으로 인계.
// LoginGate의 "지금까지 본 명반은 그대로 저장돼요" 약속을 실제로 보장한다.
// 호출 전 newUserId의 Prisma User row가 존재해야 함 (auth()가 upsert).
// 쿠키를 지우므로 Route Handler / Server Action에서만 호출할 것.
export async function adoptGuestData(newUserId: string): Promise<void> {
  const store = await cookies();
  const guestId = store.get(GUEST_COOKIE)?.value;
  if (!guestId || !guestId.startsWith("guest_") || guestId === newUserId) return;

  const guest = await db.user.findUnique({ where: { id: guestId } });
  if (guest) {
    await db.$transaction([
      db.chart.updateMany({ where: { userId: guestId }, data: { userId: newUserId } }),
      db.aiConversation.updateMany({ where: { userId: guestId }, data: { userId: newUserId } }),
      db.compatibility.updateMany({ where: { ownerId: guestId }, data: { ownerId: newUserId } }),
      // 게스트 user 삭제 — 남은 부속 데이터(일일 사용량 등)는 cascade로 정리
      db.user.delete({ where: { id: guestId } }),
    ]);
  }
  store.delete(GUEST_COOKIE);
}
