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

// ── AI 풀이 본문의 한자 용어 자동 감지(탭 시 한 줄 뜻풀이 팝오버) ──
// 프롬프트가 흐르는 상담 글로 바뀌며 [[..]] 마킹을 더는 내보내지 않으므로,
// 본문에 인라인으로 등장하는 한자(궁·별·개념)를 클라이언트에서 사전으로 매칭해
// 탭 가능한 용어로 만든다. (프롬프트/캐시 변경 불필요)

// 12궁·별 외의 자미두수 '개념어' 한자 → 한글음 + 한 줄 뜻
export const CONCEPT_GLOSS: Record<string, { ko: string; meaning: string }> = {
  空宮: { ko: '공궁', meaning: '주된 별이 없어 주변 기운을 잘 받아들이는 유연한 자리예요.' },
  四化: { ko: '사화', meaning: '별의 기운을 바꾸는 네 가지 변화(록·권·과·기)를 말해요.' },
  化祿: { ko: '화록', meaning: '재물·인연이 잘 풀리는 복의 기운이에요. (사화 중 록)' },
  化權: { ko: '화권', meaning: '권한·추진력이 강해지는 기운이에요. (사화 중 권)' },
  化科: { ko: '화과', meaning: '명예·평판·시험운을 밝혀주는 기운이에요. (사화 중 과)' },
  化忌: { ko: '화기', meaning: '집착·막힘이 생길 수 있어 살피는 기운이에요. (사화 중 기)' },
  身宮: { ko: '신궁', meaning: '후천적으로 힘이 실리는 또 하나의 인생 중심이에요.' },
};

export type GlossTermType = 'star' | 'palace' | 'concept';

// 한자 → { label '한글(한자)', desc 한 줄 뜻, type }. 궁·개념·별을 한곳에 통합.
export const HANJA_TERMS: Record<string, { label: string; desc: string; type: GlossTermType }> = (() => {
  const m: Record<string, { label: string; desc: string; type: GlossTermType }> = {};
  for (const [cn, g] of Object.entries(PALACE_GLOSS)) {
    m[cn] = { label: `${g.ko}(${cn})`, desc: g.meaning, type: 'palace' };
  }
  for (const [cn, g] of Object.entries(CONCEPT_GLOSS)) {
    m[cn] = { label: `${g.ko}(${cn})`, desc: g.meaning, type: 'concept' };
  }
  for (const [ko, v] of Object.entries(STAR_MEANINGS)) {
    if (v.hanja && !m[v.hanja]) m[v.hanja] = { label: `${ko}(${v.hanja})`, desc: v.desc, type: 'star' };
  }
  return m;
})();

// 본문에서 알려진 한자 용어를 찾는 정규식 소스(긴 한자 우선 → 命宮이 宮보다 먼저 매칭).
export const HANJA_TERM_SOURCE: string = Object.keys(HANJA_TERMS)
  .sort((a, b) => b.length - a.length)
  .join('|');

/** 텍스트에 사전에 등록된 한자 용어가 하나라도 있으면 true. */
export function hasHanjaTerms(text: string): boolean {
  return new RegExp(HANJA_TERM_SOURCE).test(text);
}
