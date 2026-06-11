import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateShareToken } from "@/lib/share-token";
import { getGuestUserId } from "@/lib/guest";
import { safeErrorBody } from "@/lib/errors";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user) return (session.user as any).id as string;
  return await getGuestUserId();
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const chart = await db.chart.findFirst({ where: { id, userId } });
    if (!chart) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const shareToken = chart.shareToken ?? generateShareToken();
    await db.chart.update({
      where: { id },
      data: { shareToken, shareEnabled: true },
    });

    return NextResponse.json({ shareToken });
  } catch (err) {
    console.error("[POST /api/charts/[id]/share] 처리 실패", err);
    return NextResponse.json(safeErrorBody(err), { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.chart.updateMany({
      where: { id, userId },
      data: { shareEnabled: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/charts/[id]/share] 처리 실패", err);
    return NextResponse.json(safeErrorBody(err), { status: 500 });
  }
}
