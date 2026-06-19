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

  // 소유권 확인 후 삭제 — 다른 사용자 명반 삭제 방지.
  const owned = await db.chart.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 자식 레코드를 함께 정리한 뒤 명반 삭제.
  // - PalaceReading/DeepReading/AiConversation/Purchase는 스키마상 onDelete:Cascade지만,
  //   Compatibility(chartA/chartB)는 cascade가 없어 FK 제약으로 삭제가 막힌다(=삭제 안 되는 원인).
  // - DB에 cascade가 적용됐는지와 무관하게 안전하도록, 모든 자식을 트랜잭션으로 먼저 삭제한다.
  try {
    await db.$transaction([
      db.palaceReading.deleteMany({ where: { chartId: id } }),
      db.deepReading.deleteMany({ where: { chartId: id } }),
      db.aiConversation.deleteMany({ where: { chartId: id } }),
      db.purchase.deleteMany({ where: { chartId: id } }),
      // 이 명반이 들어간 궁합 비교 기록도 함께 정리(둘 중 하나라도 삭제되면 비교가 무의미).
      db.compatibility.deleteMany({ where: { OR: [{ chartAId: id }, { chartBId: id }] } }),
      db.chart.delete({ where: { id } }),
    ]);
  } catch (err) {
    console.error("[DELETE /api/charts/[id]] 삭제 실패", err);
    return NextResponse.json({ error: "삭제에 실패했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
