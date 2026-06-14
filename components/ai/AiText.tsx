'use client';

// AI 응답 텍스트 렌더러.
// 1) 마크다운 기호(**, ##, - )가 섞여 와도 화면에 노출되지 않게 정리.
// 2) [[term|표시이름(한자)|아이콘키|짧은 설명]] 마킹을 탭 가능한 버튼으로 렌더하고,
//    탭하면 인라인 설명 카드를 띄운다. (별·궁·개념 모두 동일 UI)
//
// 견고성: 모델(temperature)이 같은 용어를 반복 마킹할 때 4번째 설명 필드를 생략해
// 3필드([[term|표시이름|아이콘키]])로 내보내거나, 아이콘키를 빠뜨리거나, 필드를 더
// 붙이는 경우가 있다. 파서는 2~N필드를 위치 기반으로 해석하고, 설명이 없으면
//   ① 같은 응답 안의 동일 term 마킹에 실려온 설명(glossary) →
//   ② 별 사전(STAR_MEANINGS) →
//   ③ 설명 없이 용어 버튼만(탭 시 제목만)
// 순으로 폴백한다. 어떤 깨진 형태든 raw 마킹 문자열은 절대 노출하지 않는다.
import { Fragment, useState, type ReactNode } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { STAR_MEANINGS } from '@/data/starMeanings';

type IconKey = 'star' | 'palace' | 'concept';
const ICON_KEYS: IconKey[] = ['star', 'palace', 'concept'];

interface Term {
  term: string; // 내부 식별 키 (예: 太陽)
  label: string; // 화면 표시 (예: 태양(太陽))
  icon: IconKey;
  desc: string; // 해소된 한 줄 설명 (없으면 '')
}

// 아이콘키 → 글리프 + 색 (star=골드, palace=퍼플, concept=중립). 브랜드 토큰 기반.
const ICONS: Record<IconKey, { glyph: string; fg: string; bg: string; bd: string }> = {
  star: { glyph: '★', fg: '#9C7C1E', bg: 'rgba(199,162,63,0.13)', bd: 'rgba(199,162,63,0.7)' },
  palace: { glyph: '⌂', fg: Z.p600, bg: 'rgba(124,93,199,0.13)', bd: 'rgba(124,93,199,0.6)' },
  concept: { glyph: '✦', fg: Z.ink2, bg: 'rgba(107,99,120,0.12)', bd: 'rgba(107,99,120,0.45)' },
};

// 마킹 블록: [[ ... ]] (내부에 대괄호 없음) + 최소 1개의 | 를 포함해야 용어 마킹으로 인정.
// → 파이프 없는 [[성향]] 같은 머리글 잔재는 마킹으로 보지 않는다(버튼화하지 않음).
const MARK_BLOCK_RE = /\[\[([^[\]]*\|[^[\]]*)\]\]/g;

// 표시이름에서 한글 음만 추출 ("태양(太陽)" → "태양")
function koreanOf(label: string): string {
  return label.split('(')[0].trim();
}
// 표시이름에서 괄호 안 한자만 추출 ("태양(太陽)" → "太陽", 없으면 '')
function hanjaOf(label: string): string {
  return label.match(/\(([^)]+)\)/)?.[1]?.trim() ?? '';
}

// 한 마킹을 가리키는 모든 별칭 키 (형태가 달라도 설명을 재사용하기 위함).
// 예: 표준형 term=命宮·label=명궁(命宮) ↔ term 누락형 label=명궁(命宮) 가 서로 매칭됨.
function aliasKeys(term: string, label: string): string[] {
  return [...new Set([term, label, koreanOf(label), hanjaOf(label)].filter(Boolean))];
}

// 별 사전 폴백 (한글 음 또는 term/한자 로 룩업)
function starDesc(term: string, label: string): string {
  for (const k of [koreanOf(label), term, hanjaOf(label)]) {
    if (k && STAR_MEANINGS[k]) return STAR_MEANINGS[k].desc;
  }
  return '';
}

// 아이콘키 누락 시 추론: 별 사전에 있으면 star, 아니면 concept (궁은 판별 불가 → 중립)
function inferIcon(term: string, label: string): IconKey {
  return starDesc(term, label) ? 'star' : 'concept';
}

interface ParsedMark {
  term: string;
  label: string;
  icon: IconKey;
  rawDesc: string; // 마킹에 직접 실려온 설명 (없으면 '')
}

// [[...]] 내부 필드를 | 로 나눠 해석. 2~N필드 + 깨진 형태 모두 처리.
// 핵심: 아이콘키(star/palace/concept)는 고정 토큰이므로 "값"으로 먼저 찾는다.
// 아이콘 앞쪽이 이름(2개면 term·표시이름, 1개면 표시이름), 뒤쪽이 설명이다.
// → 모델이 term 키를 빼먹고 [[표시이름|아이콘키]]로 내보내도 표시이름이 깨지지 않는다.
function parseFields(inner: string): ParsedMark {
  const fields = inner.split('|').map((f) => f.trim());
  const iconIdx = fields.findIndex((f) => ICON_KEYS.includes(f as IconKey));
  if (iconIdx >= 0) {
    const before = fields.slice(0, iconIdx).filter(Boolean);
    const term = before[0] ?? '';
    const label = before[1] || before[0] || term;
    return {
      term,
      label,
      icon: fields[iconIdx] as IconKey,
      rawDesc: fields.slice(iconIdx + 1).join('|').trim(),
    };
  }
  // 아이콘키가 아예 없음: 위치 기반(term|표시이름|설명…)으로 보고 아이콘 추론.
  const term = fields[0] ?? '';
  const label = fields[1] || term;
  return { term, label, icon: inferIcon(term, label), rawDesc: fields.slice(2).join('|').trim() };
}

/** 응답 텍스트 전체에서 (별칭 키)→설명 사전을 만든다 (설명이 실린 첫 마킹 우선). */
export function buildGlossary(text: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = new RegExp(MARK_BLOCK_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const { term, label, rawDesc } = parseFields(m[1]);
    if (!rawDesc) continue;
    for (const k of aliasKeys(term, label)) if (!map[k]) map[k] = rawDesc;
  }
  return map;
}

function cleanLine(line: string): string {
  return line
    .replace(/^#{1,6}\s*/, '') // "## 소제목" → "소제목"
    .replace(/^\s*[-*]\s+/, '• '); // "- 항목" / "* 항목" → "• 항목"
}

// **굵게** 처리 — 홀수 인덱스가 굵은 텍스트. 마킹 밖 일반 텍스트에만 적용.
function renderBold(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <b key={`${keyBase}-b${i}`}>{p}</b>
    ) : (
      <Fragment key={`${keyBase}-f${i}`}>{p.replace(/\*\*/g, '')}</Fragment>
    ),
  );
}

// 한 줄을 마킹 기준으로 쪼개 버튼/일반텍스트 노드로 변환
function renderInline(
  text: string,
  onTap: (t: Term) => void,
  resolve: (p: ParsedMark) => string,
  keyBase: string,
): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(MARK_BLOCK_RE.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...renderBold(text.slice(last, m.index), `${keyBase}-t${k}`));
    const parsed = parseFields(m[1]);
    const t: Term = { term: parsed.term, label: parsed.label, icon: parsed.icon, desc: resolve(parsed) };
    const ic = ICONS[t.icon];
    out.push(
      <button
        key={`${keyBase}-m${k}`}
        onClick={() => onTap(t)}
        style={{
          border: 'none', background: ic.bg, cursor: 'pointer',
          borderRadius: 6, padding: '0 4px', margin: 0,
          font: 'inherit', color: ic.fg, fontWeight: 700,
          borderBottom: `1.5px dotted ${ic.bd}`,
        }}
      >
        {t.label}
      </button>,
    );
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) out.push(...renderBold(text.slice(last), `${keyBase}-e`));
  return out;
}

function InfoCard({ term }: { term: Term }) {
  const ic = ICONS[term.icon];
  return (
    <div
      style={{
        marginTop: 10, background: Z.p50, border: `1px solid ${Z.p100}`,
        borderRadius: 12, padding: '11px 13px', whiteSpace: 'normal',
      }}
    >
      <div style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 700, color: ic.fg, marginBottom: term.desc ? 4 : 0 }}>
        <span style={{ marginRight: 5 }}>{ic.glyph}</span>
        {term.label}
      </div>
      {term.desc && (
        <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink, lineHeight: 1.6 }}>{term.desc}</div>
      )}
    </div>
  );
}

/**
 * 마킹·마크다운을 정리해 렌더하고, 탭한 용어의 설명 카드를 본문 아래에 표시.
 * @param glossary 응답 전체 기준 term→설명 사전 (섹션별로 쪼개 렌더할 때 상위에서 주입).
 *                 설명이 생략된 3필드 마킹의 설명을 같은 응답 다른 마킹에서 재사용하기 위함.
 */
export function AiText({ text, glossary }: { text: string; glossary?: Record<string, string> }) {
  // 탭으로 펼친 용어 (같은 용어 다시 탭하면 닫힘)
  const [open, setOpen] = useState<Term | null>(null);
  const onTap = (t: Term) =>
    setOpen((cur) => (cur?.term === t.term && cur.label === t.label ? null : t));

  // 자기 텍스트 사전 + 상위 주입 사전 병합 (둘 다 같은 응답이므로 합집합)
  const effective = { ...glossary, ...buildGlossary(text) };
  // 설명 해소: 마킹 직접 설명 → 응답 내 동일 용어(별칭 매칭) 설명 → 별 사전 → 없음
  const resolve = (p: ParsedMark) => {
    if (p.rawDesc) return p.rawDesc;
    for (const k of aliasKeys(p.term, p.label)) if (effective[k]) return effective[k];
    return starDesc(p.term, p.label) || '';
  };

  const lines = text.split('\n');
  return (
    <>
      {lines.map((rawLine, li) => (
        <Fragment key={li}>
          {li > 0 && '\n'}
          {renderInline(cleanLine(rawLine), onTap, resolve, `l${li}`)}
        </Fragment>
      ))}
      {open && <InfoCard term={open} />}
    </>
  );
}
