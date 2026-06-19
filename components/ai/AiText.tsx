'use client';

// AI 응답 텍스트 렌더러.
// 1) 마크다운 기호(**, ##, - )가 섞여 와도 화면에 노출되지 않게 정리.
// 2) [[term|표시이름(한자)|아이콘키|짧은 설명]] 마킹을 탭 가능한 버튼으로 렌더하고,
//    탭하면 버튼 옆에 떠 있는(floating) 팝오버로 설명을 띄운다. (별·궁·개념 동일 UI)
//    팝오버는 portal로 body에 렌더해 부모 카드 overflow에 잘리지 않고, anchor 버튼
//    기준으로 오른쪽→왼쪽→아래→위 순서로 자동 플립 + viewport clamp 한다.
//
// 견고성: 모델(temperature)이 같은 용어를 반복 마킹할 때 4번째 설명 필드를 생략해
// 3필드([[term|표시이름|아이콘키]])로 내보내거나, 아이콘키를 빠뜨리거나, 필드를 더
// 붙이는 경우가 있다. 파서는 2~N필드를 위치 기반으로 해석하고, 설명이 없으면
//   ① 같은 응답 안의 동일 term 마킹에 실려온 설명(glossary) →
//   ② 별 사전(STAR_MEANINGS) →
//   ③ 설명 없이 용어 버튼만(탭 시 제목만)
// 순으로 폴백한다. 어떤 깨진 형태든 raw 마킹 문자열은 절대 노출하지 않는다.
import {
  Fragment, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { STAR_MEANINGS } from '@/data/starMeanings';
import { HANJA_TERMS, HANJA_TERM_SOURCE } from '@/lib/glossary';

type IconKey = 'star' | 'palace' | 'concept';
const ICON_KEYS: IconKey[] = ['star', 'palace', 'concept'];

interface Term {
  term: string; // 내부 식별 키 (예: 太陽)
  label: string; // 화면 표시 (예: 태양(太陽))
  icon: IconKey;
  desc: string; // 해소된 한 줄 설명 (없으면 '')
}

// 용어 종류별 글리프 + 색 + 라벨 (star=골드, palace=퍼플, concept=중립). 브랜드 토큰 기반.
// 본문 버튼 / 팝오버 종류뱃지 / 범례가 모두 이 한 곳을 끌어다 쓴다 (아이콘·색·라벨 일관).
//  - label: 팝오버 헤더 종류 뱃지 문구
//  - short: 본문 아래 미니 범례 문구
export const TERM_TYPES: Record<
  IconKey,
  { glyph: string; fg: string; bg: string; bd: string; label: string; short: string }
> = {
  star: { glyph: '★', fg: '#9C7C1E', bg: 'rgba(199,162,63,0.13)', bd: 'rgba(199,162,63,0.7)', label: '별', short: '별' },
  palace: { glyph: '⌂', fg: Z.p600, bg: 'rgba(124,93,199,0.13)', bd: 'rgba(124,93,199,0.6)', label: '궁 (인생의 자리)', short: '궁(자리)' },
  concept: { glyph: '✦', fg: '#1E8E6B', bg: 'rgba(30,142,107,0.12)', bd: 'rgba(30,142,107,0.5)', label: '개념', short: '개념' },
};
// 기존 참조 호환용 별칭
const ICONS = TERM_TYPES;

// 마킹 블록: [[ ... ]] (내부에 대괄호 없음) + 최소 1개의 | 를 포함해야 용어 마킹으로 인정.
// → 파이프 없는 [[성향]] 같은 머리글 잔재는 마킹으로 보지 않는다(버튼화하지 않음).
const MARK_BLOCK_RE = /\[\[([^[\]]*\|[^[\]]*)\]\]/g;

// 알려진 별 한자 오타 교정(확장 가능). AI가 가끔 정자 한자를 틀리게 출력함.
const STAR_HANJA_FIX: Record<string, string> = { 天童: '天同' };

// 렌더 안전망 — 사용자에게 절대 노출되면 안 되는 잔재 정리.
//  1) 파이프(|)가 없는 malformed [[...]] 토큰 제거 (유효 마킹 [[a|b|..]]은 보존). 예: "[[+3]]" → ""
//  2) 알려진 별 한자 오타 교정 (天童 → 天同)
export function sanitizeMarkup(text: string): string {
  let out = text.replace(/\[\[([^[\]]*)\]\]/g, (m, inner) => (inner.includes('|') ? m : ''));
  for (const [wrong, right] of Object.entries(STAR_HANJA_FIX)) out = out.split(wrong).join(right);
  return out;
}

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

// 마킹 밖 일반 텍스트에서 사전에 등록된 한자 용어(궁·별·개념)를 찾아 탭 가능한 버튼으로 감싼다.
// → 프롬프트가 [[..]] 마킹을 안 내보내도, 본문에 인라인으로 등장한 한자(예: 命宮·空宮·太陽)에
//   탭하면 한 줄 뜻풀이 팝오버가 뜬다. (마킹 [[..]]과 동일한 버튼/팝오버 UI 재사용)
function renderTextWithTerms(
  text: string,
  onTap: (t: Term, el: HTMLElement) => void,
  keyBase: string,
): ReactNode[] {
  if (!HANJA_TERM_SOURCE) return renderBold(text, keyBase);
  const out: ReactNode[] = [];
  const re = new RegExp(HANJA_TERM_SOURCE, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...renderBold(text.slice(last, m.index), `${keyBase}-bt${k}`));
    const hanja = m[0];
    const info = HANJA_TERMS[hanja];
    const t: Term = { term: hanja, label: info.label, icon: info.type, desc: info.desc };
    const ic = ICONS[t.icon];
    out.push(
      <button
        key={`${keyBase}-ht${k}`}
        type="button"
        aria-haspopup="dialog"
        onClick={(e) => onTap(t, e.currentTarget)}
        style={{
          border: 'none', background: ic.bg, cursor: 'pointer',
          borderRadius: 6, padding: '0 4px', margin: 0,
          font: 'inherit', color: ic.fg, fontWeight: 700,
          borderBottom: `1.5px dotted ${ic.bd}`,
        }}
      >
        {hanja}
      </button>,
    );
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) out.push(...renderBold(text.slice(last), `${keyBase}-be`));
  return out;
}

// 한 줄을 마킹 기준으로 쪼개 버튼/일반텍스트 노드로 변환.
// 버튼 클릭 시 자기 DOM 요소를 anchor 로 함께 넘겨 팝오버 위치 기준으로 쓴다.
// 마킹 밖 텍스트는 renderTextWithTerms 로 보내 한자 용어 자동 감지까지 적용한다.
function renderInline(
  text: string,
  onTap: (t: Term, el: HTMLElement) => void,
  resolve: (p: ParsedMark) => string,
  keyBase: string,
): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(MARK_BLOCK_RE.source, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...renderTextWithTerms(text.slice(last, m.index), onTap, `${keyBase}-t${k}`));
    const parsed = parseFields(m[1]);
    const t: Term = { term: parsed.term, label: parsed.label, icon: parsed.icon, desc: resolve(parsed) };
    const ic = ICONS[t.icon];
    out.push(
      <button
        key={`${keyBase}-m${k}`}
        type="button"
        aria-haspopup="dialog"
        onClick={(e) => onTap(t, e.currentTarget)}
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
  if (last < text.length) out.push(...renderTextWithTerms(text.slice(last), onTap, `${keyBase}-e`));
  return out;
}

type Place = 'right' | 'left' | 'below' | 'above';
const VP_MARGIN = 8; // viewport 안쪽 여백
const GAP = 8; // anchor 와 팝오버 사이 간격
const NARROW = 420; // 이 폭 이하면 옆 배치 대신 위/아래 말풍선으로 폴백
const ARROW = 9; // 화살표(꼬리) 한 변

// 화살표(45° 회전 사각형)의 바깥 두 변에만 테두리를 줘 anchor 방향 꼬리를 만든다.
function arrowStyle(place: Place, off: number): CSSProperties {
  const b = `1px solid ${Z.p100}`;
  const h = ARROW / 2;
  const base: CSSProperties = {
    position: 'absolute', width: ARROW, height: ARROW, background: Z.white,
    transform: 'rotate(45deg)',
  };
  if (place === 'right') return { ...base, left: -h, top: off - h, borderLeft: b, borderBottom: b };
  if (place === 'left') return { ...base, right: -h, top: off - h, borderTop: b, borderRight: b };
  if (place === 'below') return { ...base, top: -h, left: off - h, borderLeft: b, borderTop: b };
  return { ...base, bottom: -h, left: off - h, borderRight: b, borderBottom: b }; // above
}

/** anchor 버튼 옆에 떠 있는 팝오버. portal 로 body 에 렌더 → 부모 overflow 무시. */
function Popover({ term, anchor, onClose }: { term: Term; anchor: HTMLElement; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; place: Place; arrow: number } | null>(null);
  // 열리는 클릭이 버튼에 포커스를 주면서 유발하는 scroll-into-view 가 곧바로 팝오버를
  // 닫지 않도록 짧은 유예. 이 시각 이전의 scroll 은 무시한다. (전환 시마다 갱신)
  const graceUntil = useRef(0);
  const ic = ICONS[term.icon];

  // 측정 후 위치 계산: 오른쪽→왼쪽→아래→위 순 자동 플립 + viewport clamp. (paint 전 동기 실행)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    graceUntil.current = performance.now() + 300; // 열림/전환 직후 scroll 무시 창
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const a = anchor.getBoundingClientRect();
    const pw = el.offsetWidth;
    const ph = el.offsetHeight;
    const narrow = vw < NARROW;
    let place: Place;
    let left: number;
    let top: number;
    if (!narrow && a.right + GAP + pw <= vw - VP_MARGIN) {
      place = 'right'; left = a.right + GAP; top = a.top + a.height / 2 - ph / 2;
    } else if (!narrow && a.left - GAP - pw >= VP_MARGIN) {
      place = 'left'; left = a.left - GAP - pw; top = a.top + a.height / 2 - ph / 2;
    } else if (a.bottom + GAP + ph <= vh - VP_MARGIN) {
      place = 'below'; left = a.left + a.width / 2 - pw / 2; top = a.bottom + GAP;
    } else {
      place = 'above'; left = a.left + a.width / 2 - pw / 2; top = a.top - GAP - ph;
    }
    const cLeft = Math.max(VP_MARGIN, Math.min(left, vw - pw - VP_MARGIN));
    const cTop = Math.max(VP_MARGIN, Math.min(top, vh - ph - VP_MARGIN));
    // 화살표는 clamp 후에도 anchor 중심을 가리키도록 팝오버 내부 오프셋으로 계산
    const arrow = place === 'right' || place === 'left'
      ? Math.max(12, Math.min(a.top + a.height / 2 - cTop, ph - 12))
      : Math.max(16, Math.min(a.left + a.width / 2 - cLeft, pw - 16));
    setPos({ left: cLeft, top: cTop, place, arrow });
  }, [anchor, term]);

  // 바깥 탭 / 스크롤 / 리사이즈 / ESC 로 닫기. (anchor 재탭은 버튼 onClick 토글에 위임)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e: Event) => {
      const t = e.target as Node;
      // 팝오버 내부·anchor·다른 용어 버튼 클릭은 무시 — 용어 전환은 버튼 onClick 토글에 맡긴다.
      // (바깥탭 close 와 전환 open 이 한 제스처에서 충돌해 새 팝오버가 사라지는 것 방지)
      const el = t instanceof Element ? t : t.parentElement;
      if (anchor.contains(t) || ref.current?.contains(t) || el?.closest('button[aria-haspopup="dialog"]')) return;
      onClose();
    };
    // 유예 창 안의 scroll(열림 유발 focus-scroll)은 무시, 이후 실제 스크롤엔 닫는다.
    const onScroll = () => { if (performance.now() >= graceUntil.current) onClose(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('scroll', onScroll, true); // capture: 내부 스크롤 컨테이너까지
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={term.label}
      style={{
        position: 'fixed',
        left: pos?.left ?? 0,
        top: pos?.top ?? 0,
        visibility: pos ? 'visible' : 'hidden', // 측정 전 깜빡임 방지
        zIndex: 10000,
        maxWidth: 'min(260px, calc(100vw - 16px))',
        background: Z.white,
        border: `1px solid ${Z.p100}`,
        borderRadius: 12,
        padding: '11px 13px',
        boxShadow: '0 8px 28px rgba(36,26,61,0.22)',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 6,
          marginBottom: term.desc ? 4 : 0,
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 700, color: ic.fg }}>
          <span style={{ marginRight: 5 }}>{ic.glyph}</span>
          {term.label}
        </span>
        {/* 종류 라벨 뱃지 — 그 타입 색으로 일관 표시 */}
        <span
          style={{
            fontFamily: SANS, fontSize: 10.5, fontWeight: 700, lineHeight: 1.4,
            color: ic.fg, background: ic.bg, border: `1px solid ${ic.bd}`,
            borderRadius: 20, padding: '1px 7px', whiteSpace: 'nowrap',
          }}
        >
          {ic.label}
        </span>
      </div>
      {term.desc && (
        <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink, lineHeight: 1.6 }}>{term.desc}</div>
      )}
      {pos && <span aria-hidden style={arrowStyle(pos.place, pos.arrow)} />}
    </div>
  );
}

/**
 * 본문 색 구분 미니 범례 (★ 별 · ⌂ 궁(자리) · ✦ 개념). TERM_TYPES 한 곳에서 끌어다 쓴다.
 * 각 항목을 그 타입 색으로 표시해 본문 버튼 색이 무엇을 뜻하는지 한눈에 알 수 있게 한다.
 */
// 각 타입이 무엇을 뜻하는지 한 줄 설명(범례용). 본문 버튼 색의 의미를 바로 알 수 있게.
const LEGEND_MEANING: Record<IconKey, string> = {
  star: '별 (타고난 기질)',
  palace: '궁 (인생 영역)',
  concept: '개념 (자미두수 용어)',
};

export function TermLegend({ style }: { style?: CSSProperties }) {
  const keys: IconKey[] = ['star', 'palace', 'concept'];
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: '3px 7px',
        background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 12,
        padding: '9px 12px',
        fontFamily: SANS, fontSize: 11.5, color: Z.ink2, lineHeight: 1.5, ...style,
      }}
    >
      <span style={{ fontWeight: 700, color: Z.p600, whiteSpace: 'nowrap' }}>
        👇 색깔 단어를 탭하면 뜻풀이가 떠요
      </span>
      {keys.map((k) => (
        <span key={k} style={{ color: TERM_TYPES[k].fg, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {TERM_TYPES[k].glyph} {LEGEND_MEANING[k]}
        </span>
      ))}
    </div>
  );
}

/**
 * 마킹·마크다운을 정리해 렌더하고, 탭한 용어의 설명을 anchor 옆 floating 팝오버로 표시.
 * @param glossary 응답 전체 기준 term→설명 사전 (섹션별로 쪼개 렌더할 때 상위에서 주입).
 *                 설명이 생략된 3필드 마킹의 설명을 같은 응답 다른 마킹에서 재사용하기 위함.
 */
export function AiText({ text, glossary }: { text: string; glossary?: Record<string, string> }) {
  // 열린 팝오버: 용어 + anchor 요소. 같은 버튼 재탭 → 닫힘 / 다른 버튼 → 그 위치로 이동.
  const [open, setOpen] = useState<{ term: Term; anchor: HTMLElement } | null>(null);
  const onTap = (t: Term, el: HTMLElement) =>
    setOpen((cur) => (cur?.anchor === el ? null : { term: t, anchor: el }));
  const close = () => setOpen(null);

  // 렌더 전 안전망: malformed [[..]] 제거 + 별 한자 오타 교정.
  const safe = sanitizeMarkup(text);

  // 자기 텍스트 사전 + 상위 주입 사전 병합 (둘 다 같은 응답이므로 합집합)
  const effective = { ...glossary, ...buildGlossary(safe) };
  // 설명 해소: 마킹 직접 설명 → 응답 내 동일 용어(별칭 매칭) 설명 → 별 사전 → 없음
  const resolve = (p: ParsedMark) => {
    if (p.rawDesc) return p.rawDesc;
    for (const k of aliasKeys(p.term, p.label)) if (effective[k]) return effective[k];
    return starDesc(p.term, p.label) || '';
  };

  const lines = safe.split('\n');
  return (
    <>
      {lines.map((rawLine, li) => (
        <Fragment key={li}>
          {li > 0 && '\n'}
          {renderInline(cleanLine(rawLine), onTap, resolve, `l${li}`)}
        </Fragment>
      ))}
      {/* open 은 클릭(클라이언트)에서만 세팅되므로 SSR 중엔 portal 미생성 */}
      {open && createPortal(<Popover term={open.term} anchor={open.anchor} onClose={close} />, document.body)}
    </>
  );
}
