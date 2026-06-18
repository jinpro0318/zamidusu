import {
  streamText,
  createDataStreamResponse,
  formatDataStreamPart,
  type CoreMessage,
} from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSystemPrompt, PROMPT_VERSION } from "@/lib/ai/prompt-builder";
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

  const { chartId, messages, palaceKey } = await req.json();
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
  const modelVersion = modelIdFor(ent.plan);

  // "초기 궁 풀이" 여부 — 고정 initPrompt 1회 append로 트리거되므로 messages가 정확히 1개.
  // 후속 자유질문은 messages가 더 길다. 캐시·thinking-off·maxTokens는 초기 풀이에만 적용.
  const isInitialReading =
    !!palaceKey && Array.isArray(messages) && messages.length === 1;

  // ── 캐시 조회 단락 (쿼터 증가 이전) ──
  // 동일 (chartId, 궁, 모델, 프롬프트 버전)이면 LLM 호출·쿼터 소비 없이 저장된 풀이를 즉시 반환.
  if (isInitialReading) {
    const cached = await db.palaceReading.findUnique({
      where: {
        chartId_palaceKey_modelVersion_promptVersion: {
          chartId: chart.id,
          palaceKey,
          modelVersion,
          promptVersion: PROMPT_VERSION,
        },
      },
    });
    if (cached) {
      // useChat이 그대로 파싱하도록 동일한 data stream 프로토콜로 흘려보낸다.
      return createDataStreamResponse({
        execute: (stream) => {
          stream.write(formatDataStreamPart("text", cached.content));
        },
      });
    }
  }

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
    palaceKey: palaceKey ?? undefined,
  });

  const result = streamText({
    model: pickModel(ent.plan),
    system,
    messages: messages as CoreMessage[],
    temperature: 0.5,
    // 초기 궁 풀이: 첫 토큰 지연(TTFB)을 줄이기 위해 thinking을 끄고 출력 길이를 제한.
    // 후속 자유질문은 기본값 유지(추론 깊이 보존).
    ...(isInitialReading
      ? {
          maxTokens: 1400,
          providerOptions: {
            google: { thinkingConfig: { thinkingBudget: 0 } },
          },
        }
      : {}),
    onFinish: async ({ text, usage }) => {
      try {
        await db.aiConversation.upsert({
          where: { id: `${chart.id}-${userId}` },
          create: {
            id: `${chart.id}-${userId}`,
            userId,
            chartId: chart.id,
            messages: JSON.stringify(messages),
            model: modelVersion,
            tokenUsage: usage?.totalTokens ?? 0,
          },
          update: {
            messages: JSON.stringify(messages),
            tokenUsage: { increment: usage?.totalTokens ?? 0 },
          },
        });
        // 초기 궁 풀이만 캐시에 저장(버전 키 포함). 후속 자유질문은 저장 안 함.
        if (isInitialReading && text?.trim()) {
          await db.palaceReading.upsert({
            where: {
              chartId_palaceKey_modelVersion_promptVersion: {
                chartId: chart.id,
                palaceKey,
                modelVersion,
                promptVersion: PROMPT_VERSION,
              },
            },
            create: {
              chartId: chart.id,
              palaceKey,
              modelVersion,
              promptVersion: PROMPT_VERSION,
              content: text,
            },
            update: { content: text },
          });
        }
      } catch (err) {
        // 응답 스트림은 끊지 않되, 저장 실패는 반드시 로그에 남긴다.
        console.error("[POST /api/ai/chat] 대화/캐시 저장 실패", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
