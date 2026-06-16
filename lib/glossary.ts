// lib/glossary.ts — 한자 용어(12궁·별)에 한글 읽기/뜻을 자동으로 붙이는 용어사전.
//   annotatePalace('命宮')        → "命宮(명궁)"  (의미는 인접 한글 영역명이 보여줌)
//   annotatePalace('命宮', true)  → "命宮(명궁 — 나의 성격·인생 중심)"
//   annotateStar('紫微')          → "紫微(자미 — 리더십·품격)"
//   annotateStar('천괴')          → "天魁(천괴 — 귀인·기회)"  (한글 입력도 한자로 보강)
// 별 의미는 data/starMeanings.ts(키워드)를 재사용 — 단일 소스 유지.
import { STAR_MEANINGS } from '@/data/starMeanings';
import { STAR_KO } from '@/lib/star-names';

// 12궁 한자 → 한글음 + 짧은 의미
export const PALACE_GLOSS: Record<string, { ko: string; meaning: string }> = {
  命宮: { ko: '명궁', meaning: '나의 성격·인생 중심' },
  兄弟宮: { ko: '형제궁', meaning: '형제·친구·동료' },
  夫妻宮: { ko: '부처궁', meaning: '연애·결혼·배우자' },
  子女宮: { ko: '자녀궁', meaning: '자녀·후배·새 시작' },
  財帛宮: { ko: '재백궁', meaning: '돈·재물의 흐름' },
  疾厄宮: { ko: '질액궁', meaning: '건강·체질' },
  遷移宮: { ko: '천이궁', meaning: '이동·해외·바깥 운' },
  奴僕宮: { ko: '노복궁', meaning: '대인관계·인맥' },
  官祿宮: { ko: '관록궁', meaning: '직업·사회적 성취' },
  田宅宮: { ko: '전택궁', meaning: '집·부동산·가정' },
  福德宮: { ko: '복덕궁', meaning: '마음의 평안·취미' },
  父母宮: { ko: '부모궁', meaning: '부모·윗사람·문서' },
};

// 한자 → 한글음 (STAR_KO + starMeanings의 hanja 필드로 보강해 보조성·살성까지 커버)
const HANJA_TO_KO: Record<string, string> = (() => {
  const m: Record<string, string> = { ...STAR_KO };
  for (const [ko, v] of Object.entries(STAR_MEANINGS)) {
    if (v.hanja) m[v.hanja] = ko;
  }
  return m;
})();

const isHanja = (s: string) => /[㐀-鿿]/.test(s);

// 별의 짧은 의미 = 키워드 묶음 (예: ['귀인','기회'] → "귀인·기회")
function shortStarMeaning(ko: string): string | undefined {
  const kw = STAR_MEANINGS[ko]?.keywords;
  return kw && kw.length ? kw.join('·') : undefined;
}

/**
 * 별 용어 주석. 입력은 한자(紫微) 또는 한글(자미/천괴) 모두 허용.
 * 반환 형식: "한자(한글음 — 짧은 의미)". 사전에 없는 용어는 입력 그대로 반환.
 */
export function annotateStar(input: string): string {
  const hanja = isHanja(input) ? input : STAR_MEANINGS[input]?.hanja;
  const ko = isHanja(input) ? HANJA_TO_KO[input] : input;
  if (!ko && !hanja) return input;
  const meaning = ko ? shortStarMeaning(ko) : undefined;
  if (hanja && ko && hanja !== ko) {
    return `${hanja}(${ko}${meaning ? ` — ${meaning}` : ''})`;
  }
  const base = hanja ?? ko ?? input;
  return meaning ? `${base} — ${meaning}` : base;
}

/**
 * 궁 이름 주석. 기본은 "命宮(명궁)" 읽기만 (의미는 보통 인접 한글 영역명이 보여줌).
 * withMeaning=true 면 "命宮(명궁 — 나의 성격·인생 중심)".
 */
export function annotatePalace(cn: string, withMeaning = false): string {
  const g = PALACE_GLOSS[cn];
  if (!g) return cn;
  return withMeaning ? `${cn}(${g.ko} — ${g.meaning})` : `${cn}(${g.ko})`;
}
