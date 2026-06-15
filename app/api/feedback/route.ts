import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const TYPES = ["문의", "버그 신고", "기능 제안", "기타"];

// 고객센터(의견 보내기) 접수 엔드포인트 → Supabase Feedback 테이블에 저장.
export async function POST(req: Request) {
  let body: { type?: string; message?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const type = typeof body.type === "string" && TYPES.includes(body.type) ? body.type : "문의";
  const message = (body.message ?? "").trim();
  const email = (body.email ?? "").trim();

  if (message.length < 5) {
    return NextResponse.json({ error: "message_too_short" }, { status: 400 });
  }

  // 로그인 사용자라면 식별자 같이 적재 (비로그인/게스트도 제출 허용)
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.user?.id ?? null;
  } catch {
    // 세션 조회 실패는 무시 — 익명 의견으로 저장
  }

  try {
    const saved = await db.feedback.create({
      data: {
        type,
        content: message.slice(0, 4000),
        replyEmail: email || null,
        // userId가 우리 User 테이블에 없으면(예: 만료/불일치) FK 위반 방지를 위해 null 저장.
        userId: userId && (await db.user.findUnique({ where: { id: userId }, select: { id: true } })) ? userId : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error("[feedback] 저장 실패", err);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
