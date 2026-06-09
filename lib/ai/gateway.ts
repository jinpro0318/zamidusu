// Google Gemini provider — @ai-sdk/google v1 (AI SDK v4 호환).
// 환경변수 GOOGLE_GENERATIVE_AI_API_KEY 또는 GEMINI_API_KEY 사용.
// API 키 발급: https://aistudio.google.com/app/apikey

import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
  process.env.GEMINI_API_KEY ??
  process.env.AI_GATEWAY_API_KEY ??
  "";

const provider = createGoogleGenerativeAI({ apiKey });

// 플랜별 Gemini 모델 분기.
// - FREE: gemini-1.5-flash (가성비, 무료 tier 가능)
// - PREMIUM: gemini-2.0-flash (속도·품질 균형)
// - PRO: gemini-2.5-pro (최고 품질, 컨텍스트 1M)
export function modelIdFor(plan: "FREE" | "PREMIUM" | "PRO"): string {
  if (plan === "PRO") return "gemini-2.5-pro";
  if (plan === "PREMIUM") return "gemini-2.0-flash";
  return "gemini-1.5-flash";
}

export function pickModel(plan: "FREE" | "PREMIUM" | "PRO") {
  return provider(modelIdFor(plan) as any);
}
