import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeCompatibility } from "@/lib/iztro/compatibility";
import { getGuestUserId } from "@/lib/guest";

const InputSchema = z.object({
  chartAId: z.string(),
  chartBId: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = InputSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { chartAId, chartBId } = parsed.data;

  if (chartAId === chartBId) {
    return NextResponse.json({ error: "같은 명반은 비교할 수 없어요." }, { status: 400 });
  }

  const [a, b] = await Promise.all([
    db.chart.findFirst({ where: { id: chartAId, userId } }),
    db.chart.findFirst({ where: { id: chartBId, userId } }),
  ]);
  if (!a || !b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payloadA = JSON.parse(a.payload);
  const payloadB = JSON.parse(b.payload);
  const score = computeCompatibility(payloadA, payloadB);

  // upsert (chartA, chartB) 순서를 정규화하여 중복 방지
  const [lo, hi] = [chartAId, chartBId].sort();
  const existing = await db.compatibility.findUnique({
    where: { chartAId_chartBId: { chartAId: lo, chartBId: hi } },
  });

  const record = existing
    ? await db.compatibility.update({
        where: { id: existing.id },
        data: { score: score.total, detail: JSON.stringify(score) },
      })
    : await db.compatibility.create({
        data: {
          ownerId: userId,
          chartAId: lo,
          chartBId: hi,
          score: score.total,
          detail: JSON.stringify(score),
        },
      });

  return NextResponse.json({ id: record.id, score });
}
