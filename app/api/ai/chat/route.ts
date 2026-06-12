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
  if (!userId) {
    return new Response("사용자 정보를 찾을 수 없어요.", { status: 401 });
  }

  const { chartId, messages } = await req.json();
  // 입력 상한 — 과도한 컨텍스트로 인한 토큰 비용 방지
  if (!Array.isArray(messages) || messages.length > 40) {
    return new Response("대화가 너무 길어요. 새 대화를 시작해 주세요.", { status: 400 });
  }
  const last = messages.at(-1);
  if (last?.role === "user") {
    if (typeof last.content === "string" && last.content.length > 1000) {
      return new Response("질문은 1,000자 이내로 입력해 주세요.", { status: 400 });
    }
    const safety = isSafeQuery(last.content ?? "");
    if (!safety.ok) {
      return new Response(safety.reason, { status: 400 });
    }
  }

  const chart = await db.chart.findFirst({ where: { id: chartId, userId } });
  if (!chart) return new Response("Not found", { status: 404 });

  const ent = await getEntitlements(userId);
  // 일일 턴 한도 — KST 기준 날짜별로 정확히 집계. upsert increment라 동시 요청에도 원자적.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const usage = await db.aiDailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, turns: 1 },
    update: { turns: { increment: 1 } },
  });
  if (usage.turns > ent.aiTurnsPerDay) {
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
      } catch (err) {
        // 응답 스트림은 끊지 않되, 사용량 기록 실패는 반드시 로그에 남긴다.
        console.error("[POST /api/ai/chat] 대화 저장 실패", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
