import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/auth";
import { adoptGuestData } from "@/lib/guest";

// 이메일+비밀번호 로그인은 /auth/callback을 거치지 않으므로
// 클라이언트가 로그인 직후 이 엔드포인트를 호출해 게스트 데이터를 인계한다.
// ensureUser()로 Prisma User 동기화(upsert)도 이 시점에 1회 수행한다.
export async function POST() {
  const session = await ensureUser();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await adoptGuestData(session.user.id);
  } catch (err) {
    console.error("[POST /api/auth/adopt-guest] 게스트 데이터 인계 실패", err);
  }
  return NextResponse.json({ ok: true });
}
