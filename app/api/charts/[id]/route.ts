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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.chart.deleteMany({ where: { id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
