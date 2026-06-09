import { db } from "@/lib/db";

export type Plan = "FREE" | "PREMIUM" | "PRO";

export interface Entitlements {
  plan: Plan;
  aiTurnsPerDay: number;
  model: "haiku" | "sonnet" | "opus";
  compatibilityPerMonth: number;
  premiumUnlock: boolean; // 구독자는 모든 차트의 프리미엄 자동 unlock
  maxCharts: number; // -1 = unlimited
}

const CONFIG: Record<Plan, Entitlements> = {
  FREE: {
    plan: "FREE",
    aiTurnsPerDay: 5,
    model: "haiku",
    compatibilityPerMonth: 1,
    premiumUnlock: false,
    maxCharts: 3,
  },
  PREMIUM: {
    plan: "PREMIUM",
    aiTurnsPerDay: 50,
    model: "sonnet",
    compatibilityPerMonth: 10,
    premiumUnlock: true,
    maxCharts: -1,
  },
  PRO: {
    plan: "PRO",
    aiTurnsPerDay: 200,
    model: "opus",
    compatibilityPerMonth: -1,
    premiumUnlock: true,
    maxCharts: -1,
  },
};

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const sub = await db.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  const plan: Plan = (sub?.plan as Plan) ?? "FREE";
  return CONFIG[plan];
}

export function entitlementsFor(plan: Plan): Entitlements {
  return CONFIG[plan];
}
