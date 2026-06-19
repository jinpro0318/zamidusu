import {
  streamText,
  createDataStreamResponse,
  formatDataStreamPart,
  type CoreMessage,
} from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildCompatPrompt, PROMPT_VERSION } from "@/lib/ai/prompt-builder";
import { pickModel, modelIdFor } from "@/lib/ai/gateway";
import { getEntitlements } from "@/lib/entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

// 궁합(두 사람 관계) AI 해석. 회원 전용.
// 캐시: 기존 DeepReading 재사용 — chartId=chartAId, section="compat:<chartBId>" (키에 두 명반 id + modelVersion + promptVersion 포함).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("로그인이 필요해요.", { status: 401 });
  const userId = (session.user as any).id as string;

  const { compatId, messages } = await req.json();
  if (!Array.isArray(messages) || messages.length > 40) {
    return new Response("요청이 올바르지 않아요.", { status: 400 });
  }

  // 궁합 레코드 조회와 구독(entitlements) 조회는 독립 → 병렬 실행으로 캐시 히트 경로 단축.
  const [rec, ent] = await Promise.all([
    db.compatibility.findFirst({
      where: { id: compatId, ownerId: userId },
      include: { chartA: true, chartB: true },
    }),
    getEntitlements(userId),
  ]);
  if (!rec) return new Response("Not found", { status: 404 });

  const modelVersion = modelIdFor(ent.plan);
  const section = `compat:${rec.chartBId}`;
  const isInitial = Array.isArray(messages) && messages.length === 1;

  // 캐시 조회 (쿼터/생성 이전)
  if (isInitial) {
    const cached = await db.deepReading.findUnique({
      where: {
        chartId_section_modelVersion_promptVersion: {
          chartId: rec.chartAId,
          section,
          modelVersion,
          promptVersion: PROMPT_VERSION,
        },
      },
    });
    if (cached) {
      return createDataStreamResponse({
        execute: (stream) => stream.write(formatDataStreamPart("text", cached.content)),
      });
    }
  }

  // 성별로 남/여를 정해 프롬프트 구성(캐시 키는 chartA/B 그대로라 안정적).
  const male = rec.chartA.gender === "MALE" ? rec.chartA : rec.chartB;
  const female = male === rec.chartA ? rec.chartB : rec.chartA;
  const system = buildCompatPrompt({
    payloadA: JSON.parse(male.payload),
    payloadB: JSON.parse(female.payload),
    nameA: male.subjectName?.trim() || "남자",
    nameB: female.subjectName?.trim() || "여자",
  });

  const result = streamText({
    model: pickModel(ent.plan),
    system,
    messages: messages as CoreMessage[],
    temperature: 0.6,
    ...(isInitial
      ? { maxTokens: 2200, providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } } }
      : {}),
    onFinish: async ({ text }) => {
      try {
        if (isInitial && text?.trim()) {
          await db.deepReading.upsert({
            where: {
              chartId_section_modelVersion_promptVersion: {
                chartId: rec.chartAId,
                section,
                modelVersion,
                promptVersion: PROMPT_VERSION,
              },
            },
            create: { chartId: rec.chartAId, section, modelVersion, promptVersion: PROMPT_VERSION, content: text },
            update: { content: text },
          });
        }
      } catch (err) {
        console.error("[POST /api/compatibility/reading] 캐시 저장 실패", err);
      }
    },
  });

  return result.toDataStreamResponse();
}
