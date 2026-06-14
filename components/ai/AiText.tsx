'use client';

// AI 응답 텍스트 렌더러.
// 1) 마크다운 기호(**, ##, - )가 섞여 와도 화면에 노출되지 않게 정리.
// 2) [[term|표시이름(한자)|아이콘키|짧은 설명]] 마킹을 탭 가능한 버튼으로 렌더하고,
//    탭하면 인라인 설명 카드를 띄운다. (별·궁·개념 모두 동일 UI — 기존 별 카드 재사용)
import { Fragment, useState, type ReactNode } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';

type IconKey = 'star' | 'palace' | 'concept';

interface Term {
  term: string; // 내부 식별 키 (예: 太陽)
  label: string; // 화면 표시 (예: 태양(太陽))
  icon: IconKey;
  desc: string; // 팝업 한 줄 설명
}

// [[term|표시이름(한자)|아이콘키|짧은 설명]] — 4필드 파이프 구분. 설명에 ']' 미포함 가정.
const MARK_RE = /\[\[([^\]|]+)\|([^\]|]+)\|(star|palace|concept)\|([^\]]+)\]\]/g;

// 아이콘키 → 글리프 + 색 (star=골드, palace=퍼플, concept=중립). 브랜드 토큰 기반.
const ICONS: Record<IconKey, { glyph: string; fg: string; bg: string; bd: string }> = {
  star: { glyph: '★', fg: '#9C7C1E', bg: 'rgba(199,162,63,0.13)', bd: 'rgba(199,162,63,0.7)' },
  palace: { glyph: '⌂', fg: Z.p600, bg: 'rgba(124,93,199,0.13)', bd: 'rgba(124,93,199,0.6)' },
  concept: { glyph: '✦', fg: Z.ink2, bg: 'rgba(107,99,120,0.12)', bd: 'rgba(107,99,120,0.45)' },
};

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
function renderInline(text: string, onTap: (t: Term) => void, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(MARK_RE.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...renderBold(text.slice(last, m.index), `${keyBase}-t${k}`));
    const t: Term = { term: m[1], label: m[2], icon: m[3] as IconKey, desc: m[4] };
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
      <div style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 700, color: ic.fg, marginBottom: 4 }}>
        <span style={{ marginRight: 5 }}>{ic.glyph}</span>
        {term.label}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink, lineHeight: 1.6 }}>{term.desc}</div>
    </div>
  );
}

/** 마킹·마크다운을 정리해 렌더하고, 탭한 용어의 설명 카드를 본문 아래에 표시 */
export function AiText({ text }: { text: string }) {
  // 탭으로 펼친 용어 (같은 용어 다시 탭하면 닫힘)
  const [open, setOpen] = useState<Term | null>(null);
  const onTap = (t: Term) =>
    setOpen((cur) => (cur?.term === t.term && cur.label === t.label ? null : t));

  const lines = text.split('\n');
  return (
    <>
      {lines.map((rawLine, li) => (
        <Fragment key={li}>
          {li > 0 && '\n'}
          {renderInline(cleanLine(rawLine), onTap, `l${li}`)}
        </Fragment>
      ))}
      {open && <InfoCard term={open} />}
    </>
  );
}
