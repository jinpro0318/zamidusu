import { streamText, type CoreMessage } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/prompt-builder";
import { pickModel, modelIdFor } from "@/lib/ai/gateway";
import { isSafeQuery } from "@/lib/ai/guardrails";
import { getEntitlements } from "@/lib/entitlements";
import { getGuestUserId } from "@/lib/guest";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { chartId, messages } = await req.json();
  const last = messages?.at(-1);
  if (last?.role === "user") {
    const safety = isSafeQuery(last.content ?? "");
    if (!safety.ok) {
      return new Response(safety.reason, { status: 400 });
    }
  }

  const chart = await db.chart.findFirst({ where: { id: chartId, userId } });
  if (!chart) return new Response("Not found", { status: 404 });

  const ent = await getEntitlements(userId);
  // 간단한 일별 한도 체크 (실제는 Redis/RuntimeCache 권장)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const usedToday = await db.aiConversation.aggregate({
    where: { userId, updatedAt: { gte: todayStart } },
    _sum: { tokenUsage: true },
  });
  const usedTurns = (usedToday._sum.tokenUsage ?? 0) / 800; // 평균 토큰/턴 추정
  if (usedTurns >= ent.aiTurnsPerDay) {
    return new Response(
      `오늘의 AI 사용량을 모두 사용했어요. (한도 ${ent.aiTurnsPerDay}턴)`,
      { status: 402 },
    );
  }

  const payload = JSON.parse(chart.payload);
  const system = buildSystemPrompt({
    payload,
    subjectName: chart.subjectName,
    gender: chart.gender,
    plan: ent.plan,
  });

  const result = streamText({
    model: pickModel(ent.plan),
    system,
    messages: messages as CoreMessage[],
    temperature: 0.5,
    onFinish: async ({ usage }) => {
      try {
        await db.aiConversation.upsert({
          where: { id: `${chart.id}-${userId}` },
          create: {
            id: `${chart.id}-${userId}`,
            userId,
            chartId: chart.id,
            messages: JSON.stringify(messages),
            model: modelIdFor(ent.plan),
            tokenUsage: usage?.totalTokens ?? 0,
          },
          update: {
            messages: JSON.stringify(messages),
            tokenUsage: { increment: usage?.totalTokens ?? 0 },
          },
        });
      } catch {
        // 사일런트 — 응답 끊김 방지
      }
    },
  });

  return result.toDataStreamResponse();
}
