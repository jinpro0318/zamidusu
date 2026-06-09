import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateShareToken } from "@/lib/share-token";
import { getGuestUserId } from "@/lib/guest";

async function resolveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user) return (session.user as any).id as string;
  return await getGuestUserId();
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shareToken = chart.shareToken ?? generateShareToken();
  await db.chart.update({
    where: { id },
    data: { shareToken, shareEnabled: true },
  });

  return NextResponse.json({ shareToken });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.chart.updateMany({
    where: { id, userId },
    data: { shareEnabled: false },
  });
  return NextResponse.json({ ok: true });
}
