import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user) return (session.user as any).id as string;
  return await getGuestUserId();
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...chart, payload: JSON.parse(chart.payload) });
}

// 명반 이름(subjectName) 수정 — 표시용 이름만 변경(출생정보·명반 payload는 불변).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }
  const raw = typeof body?.subjectName === "string" ? body.subjectName.trim() : "";
  if (raw.length > 40) {
    return NextResponse.json({ error: "이름은 40자 이내로 입력해 주세요." }, { status: 400 });
  }
  const subjectName = raw.length > 0 ? raw : null; // 빈 값이면 기본 표시명으로

  const result = await db.chart.updateMany({ where: { id, userId }, data: { subjectName } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, subjectName });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.chart.deleteMany({ where: { id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
