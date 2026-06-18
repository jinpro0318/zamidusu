import {
  streamText,
  createDataStreamResponse,
  formatDataStreamPart,
  type CoreMessage,
} from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPurchased } from "@/lib/purchase";
import {
  buildSystemPrompt,
  buildDeepReadingPrompt,
  DEEP_SECTION,
  PROMPT_VERSION,
} from "@/lib/ai/prompt-builder";
import { pickModel, modelIdFor } from "@/lib/ai/gateway";
import { isSafeQuery } from "@/lib/ai/guardrails";
import { getEntitlements } from "@/lib/entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // 상세풀이·깊은풀이 모두 회원 전용(무료요약은 이 라우트를 타지 않음).
  const session = await auth();
  if (!session?.user) {
    return new Response("로그인이 필요해요.", { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const { chartId, messages, palaceKey, mode } = await req.json();
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

  // 깊은풀이(mode:"deep")만 결제(PAID) 필수. 궁별 상세풀이는 로그인만으로 허용.
  // 캐시 조회·쿼터·생성보다 먼저 차단 → 미결제자는 DeepReading 캐시 응답도 못 받음.
  const isDeep = mode === "deep";
  if (isDeep && !(await hasPurchased(userId, chart.id))) {
    return new Response("깊은 풀이는 결제 후 이용할 수 있어요.", { status: 403 });
  }

  const ent = await getEntitlements(userId);
  const modelVersion = modelIdFor(ent.plan);

  // "초기 풀이" 여부 — 궁별(palaceKey) 또는 깊은풀이(deep)가 고정 initPrompt 1회로 트리거(messages 1개).
  // 후속 자유질문은 messages가 더 길다. 캐시·thinking-off·maxTokens는 초기 풀이에만 적용.
  const isInitialReading =
    (!!palaceKey || isDeep) && Array.isArray(messages) && messages.length === 1;

  // ── 캐시 조회 단락 (쿼터 증가 이전) ──
  // 동일 키면 LLM 호출·쿼터 소비 없이 저장된 풀이를 즉시 반환. 깊은풀이=DeepReading, 궁별=PalaceReading.
  if (isInitialReading) {
    const cached = isDeep
      ? await db.deepReading.findUnique({
          where: {
            chartId_section_modelVersion_promptVersion: {
              chartId: chart.id,
              section: DEEP_SECTION,
              modelVersion,
              promptVersion: PROMPT_VERSION,
            },
          },
        })
      : await db.palaceReading.findUnique({
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

  // 한도 정책 단순화: 궁별 상세풀이는 로그인 회원이면 무제한(턴 한도 없음).
  // 비로그인 차단은 위 401에서 처리, 깊은풀이 결제는 위 403에서 처리.

  const payload = JSON.parse(chart.payload);
  const system = isDeep
    ? buildDeepReadingPrompt({
        payload,
        subjectName: chart.subjectName,
        gender: chart.gender,
        plan: ent.plan,
      })
    : buildSystemPrompt({
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
          maxTokens: isDeep ? 2600 : 1400, // 깊은풀이는 4섹션 종합이라 더 길다
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
        // 초기 풀이만 캐시에 저장(버전 키 포함). 후속 자유질문은 저장 안 함.
        if (isInitialReading && text?.trim()) {
          if (isDeep) {
            await db.deepReading.upsert({
              where: {
                chartId_section_modelVersion_promptVersion: {
                  chartId: chart.id,
                  section: DEEP_SECTION,
                  modelVersion,
                  promptVersion: PROMPT_VERSION,
                },
              },
              create: {
                chartId: chart.id,
                section: DEEP_SECTION,
                modelVersion,
                promptVersion: PROMPT_VERSION,
                content: text,
              },
              update: { content: text },
            });
          } else {
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
        }
      } catch (err) {
        // 응답 스트림은 끊지 않되, 저장 실패는 반드시 로그에 남긴다.
        console.error("[POST /api/ai/chat] 대화/캐시 저장 실패", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
