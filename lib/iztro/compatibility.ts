// 자체 자미두수 궁합 점수 알고리즘.
// iztro에는 synastry 기능이 없으므로 직접 구현.
// 학문적 절대성이 아니라 "사용자에게 직관적이고 일관된 점수"를 목표.

import type { AstrolabePayload, PalaceLite } from "./types";

export interface CompatibilityScore {
  total: number; // 0-100
  love: number;
  work: number;
  family: number;
  breakdown: BreakdownItem[];
}

export interface BreakdownItem {
  category: "love" | "work" | "family";
  label: string;
  delta: number;
  detail: string;
}

const WEIGHTS = { love: 0.5, work: 0.3, family: 0.2 } as const;

// 지지 6합: 子丑/寅亥/卯戌/辰酉/巳申/午未
const HARMONIES: Record<string, string> = {
  子: "丑", 丑: "子",
  寅: "亥", 亥: "寅",
  卯: "戌", 戌: "卯",
  辰: "酉", 酉: "辰",
  巳: "申", 申: "巳",
  午: "未", 未: "午",
};

// 지지 6충: 子午/丑未/寅申/卯酉/辰戌/巳亥
const CLASHES: Record<string, string> = {
  子: "午", 午: "子",
  丑: "未", 未: "丑",
  寅: "申", 申: "寅",
  卯: "酉", 酉: "卯",
  辰: "戌", 戌: "辰",
  巳: "亥", 亥: "巳",
};

const LUCKY_PAIR = ["자미", "천부", "태양", "태음"];
const HARSH_STARS = ["칠살", "파군"];

export function computeCompatibility(a: AstrolabePayload, b: AstrolabePayload): CompatibilityScore {
  const items: BreakdownItem[] = [];

  // 1) 명궁 지지 합·충
  const aSoul = normalizeBranch(a.earthlyBranchOfSoulPalace);
  const bSoul = normalizeBranch(b.earthlyBranchOfSoulPalace);
  if (HARMONIES[aSoul] === bSoul) {
    items.push({ category: "love", label: "명궁 지지 6합", delta: 20, detail: `${aSoul} - ${bSoul} 6합` });
  } else if (CLASHES[aSoul] === bSoul) {
    items.push({ category: "love", label: "명궁 지지 6충", delta: -15, detail: `${aSoul} - ${bSoul} 6충` });
  } else {
    items.push({ category: "love", label: "명궁 지지 관계", delta: 0, detail: "특이 관계 없음" });
  }

  // 2) 부처궁 ↔ 상대 명궁
  items.push(scoreStarPair(palaceByName(a, "부처"), palaceByName(b, "명"), "love", "A 부처궁 vs B 명궁"));
  items.push(scoreStarPair(palaceByName(b, "부처"), palaceByName(a, "명"), "love", "B 부처궁 vs A 명궁"));

  // 3) 교우궁 호환 → 직장운
  items.push(scoreStarPair(palaceByName(a, "교우"), palaceByName(b, "명"), "work", "교우/직장운 호환"));

  // 4) 사화 충돌 검사: 상대 화기궁이 본인 명궁이면 −10, 화록궁이면 +15
  items.push(scoreMutagen(a, b));

  // 5) 오행국 상생/상극 — family
  items.push(scoreFiveElements(a.fiveElementsClass, b.fiveElementsClass));

  const love = avg(items.filter((i) => i.category === "love"));
  const work = avg(items.filter((i) => i.category === "work"));
  const family = avg(items.filter((i) => i.category === "family"));
  const total = Math.round(love * WEIGHTS.love + work * WEIGHTS.work + family * WEIGHTS.family);

  return { total, love: round(love), work: round(work), family: round(family), breakdown: items };
}

function palaceByName(a: AstrolabePayload, partial: string): PalaceLite | undefined {
  return a.palaces.find((p) => p.name.includes(partial));
}

function scoreStarPair(
  source: PalaceLite | undefined,
  target: PalaceLite | undefined,
  category: BreakdownItem["category"],
  label: string,
): BreakdownItem {
  if (!source || !target) {
    return { category, label, delta: 0, detail: "데이터 부족" };
  }
  let delta = 0;
  const details: string[] = [];
  for (const ss of source.majorStars) {
    for (const ts of target.majorStars) {
      if (LUCKY_PAIR.includes(ss.name) && LUCKY_PAIR.includes(ts.name)) {
        delta += 12;
        details.push(`${ss.name} ↔ ${ts.name} 길성 동회`);
      } else if (HARSH_STARS.includes(ss.name) && HARSH_STARS.includes(ts.name)) {
        delta -= 6;
        details.push(`${ss.name} ↔ ${ts.name} 흉성 동회`);
      }
    }
  }
  return { category, label, delta, detail: details.join(", ") || "특이 패턴 없음" };
}

function scoreMutagen(a: AstrolabePayload, b: AstrolabePayload): BreakdownItem {
  let delta = 0;
  const details: string[] = [];
  const bSoulIdx = b.palaces.findIndex((p) => p.name.includes("명"));
  const aSoulIdx = a.palaces.findIndex((p) => p.name.includes("명"));

  a.palaces.forEach((p, idx) => {
    p.majorStars.forEach((s) => {
      if (s.mutagen === "화기" && idx === bSoulIdx) {
        delta -= 10;
        details.push(`A ${p.name} 화기가 B 명궁 충`);
      }
      if (s.mutagen === "화록" && idx === bSoulIdx) {
        delta += 15;
        details.push(`A ${p.name} 화록이 B 명궁`);
      }
    });
  });
  b.palaces.forEach((p, idx) => {
    p.majorStars.forEach((s) => {
      if (s.mutagen === "화기" && idx === aSoulIdx) {
        delta -= 10;
        details.push(`B ${p.name} 화기가 A 명궁 충`);
      }
      if (s.mutagen === "화록" && idx === aSoulIdx) {
        delta += 15;
        details.push(`B ${p.name} 화록이 A 명궁`);
      }
    });
  });

  return { category: "love", label: "사화(四化) 영향", delta, detail: details.join(", ") || "특이 사화 없음" };
}

// 오행국: 수이국·목삼국·금사국·토오국·화육국
function scoreFiveElements(aClass: string, bClass: string): BreakdownItem {
  const elementOf = (s: string): "수" | "목" | "금" | "토" | "화" | null => {
    if (s.includes("수")) return "수";
    if (s.includes("목")) return "목";
    if (s.includes("금")) return "금";
    if (s.includes("토")) return "토";
    if (s.includes("화")) return "화";
    return null;
  };
  const ae = elementOf(aClass);
  const be = elementOf(bClass);
  if (!ae || !be) return { category: "family", label: "오행국", delta: 0, detail: "데이터 부족" };

  // 상생: 목→화→토→금→수→목
  const generate: Record<string, string> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  // 상극: 목→토, 토→수, 수→화, 화→금, 금→목
  const overcome: Record<string, string> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" };

  if (generate[ae] === be || generate[be] === ae) {
    return { category: "family", label: "오행국 상생", delta: 10, detail: `${ae}↔${be} 상생` };
  }
  if (overcome[ae] === be || overcome[be] === ae) {
    return { category: "family", label: "오행국 상극", delta: -5, detail: `${ae}↔${be} 상극` };
  }
  if (ae === be) {
    return { category: "family", label: "오행국 비화", delta: 5, detail: `${ae}↔${be} 동일` };
  }
  return { category: "family", label: "오행국", delta: 0, detail: `${ae}↔${be}` };
}

function normalizeBranch(s: string): string {
  // iztro는 한자 그대로 반환할 수 있음. 그대로 비교.
  return s;
}

function avg(items: BreakdownItem[]): number {
  if (!items.length) return 50;
  const base = 50;
  const sum = items.reduce((acc, i) => acc + i.delta, 0);
  return clamp(base + sum, 0, 100);
}

function round(n: number): number {
  return Math.round(n);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
