export interface DecadalSlice {
  startAge: number;
  endAge: number;
  palaceName: string;
  heavenlyStem?: string;
  earthlyBranch?: string;
  majorStars: string[];
  score: number;
}

// 이미 직렬화된 AstrolabePayload는 horoscope 메서드를 잃었으므로
// 별도로 라이브 객체를 호출하거나, payload에서 대운 정보를 재추출하는 헬퍼.
export function extractDecadals(payload: any): DecadalSlice[] {
  const palaces = payload.palaces ?? [];
  return palaces
    .filter((p: any) => p.decadal?.range)
    .map((p: any) => {
      const [startAge, endAge] = p.decadal.range;
      const majorStars = (p.majorStars ?? []).map((s: any) => s.name);
      return {
        startAge,
        endAge,
        palaceName: p.name,
        heavenlyStem: p.decadal.heavenlyStem ?? p.heavenlyStem,
        earthlyBranch: p.decadal.earthlyBranch ?? p.earthlyBranch,
        majorStars,
        score: scoreDecadal(p),
      };
    })
    .sort((a: DecadalSlice, b: DecadalSlice) => a.startAge - b.startAge);
}

// 길성/흉성/사화를 간단히 점수화 (0-100 정규화).
const LUCKY_STARS = ["자미", "천부", "태양", "태음", "천동", "천량", "록존", "천마", "좌보", "우필", "문창", "문곡"];
const UNLUCKY_STARS = ["칠살", "파군", "탐랑", "거문", "경양", "타라", "화성", "영성", "지공", "지겁"];

function scoreDecadal(p: any): number {
  let s = 50;
  const allStars: any[] = [...(p.majorStars ?? []), ...(p.minorStars ?? []), ...(p.adjectiveStars ?? [])];
  for (const star of allStars) {
    if (LUCKY_STARS.includes(star.name)) s += 6;
    if (UNLUCKY_STARS.includes(star.name)) s -= 4;
    if (star.mutagen === "화록") s += 8;
    if (star.mutagen === "화권") s += 5;
    if (star.mutagen === "화과") s += 4;
    if (star.mutagen === "화기") s -= 8;
  }
  return Math.max(0, Math.min(100, s));
}

export function currentDecadalAge(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}
