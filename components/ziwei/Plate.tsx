'use client';

// components/ui/Plate.tsx — the square 명반 plate (4×4, dark + gold)
import type { CSSProperties } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { Brightness } from '@/components/ziwei/atoms';
import { starKo } from '@/lib/star-names';
import type { Area } from '@/lib/ziwei-types';

// "·" 구분 텍스트를 토큰 단위로만 줄바꿈되게 렌더 (토큰 내부 글자는 절대 안 쪼개짐)
function TokenLine({ text, style }: { text: string; style: CSSProperties }) {
  const tokens = text.split('·').filter(Boolean);
  return (
    <span style={{ ...style, display: 'inline-flex', flexWrap: 'wrap', columnGap: 0 }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ whiteSpace: 'nowrap' }}>
          {i > 0 ? '·' : ''}{t}
        </span>
      ))}
    </span>
  );
}

export function Plate({
  selKey = '命宮',
  onSel,
  scale = 1,
  easy = false,
  areas,
  centerLine,
}: {
  selKey?: string;
  onSel?: (cn: string) => void;
  scale?: number;
  easy?: boolean;
  areas?: Area[];
  centerLine?: string;
}) {
  const list = areas && areas.length ? areas : DEFAULT_AREAS;
  const cell = (a: Area) => {
    const sel = a.cn === selKey;
    // 그리드 칸에는 주성만(★ 마커) 표시. 空宮이면 보조성 최대 2개로 폴백, 그것도 없으면 空宮.
    const koStars =
      a.stars.length > 0
        ? a.stars.map((s) => `★${starKo(s)}`).join('·') // 예: "★무곡·★탐랑"
        : (a.subStars && a.subStars.length > 0 ? a.subStars.slice(0, 2).join('·') : '空宮');
    // 칸 폭을 넘치지 않게 글자 수에 따라 폰트를 살짝 축소 (그리드 비율 유지)
    const starFs = (koStars.length > 10 ? 8 : koStars.length > 7 ? 8.5 : 9.5) * scale;
    const koFs = (a.ko.length > 5 ? 10.5 : 11.5) * scale;
    return (
      <button
        key={a.cn}
        type="button"
        onClick={() => onSel?.(a.cn)}
        aria-label={`${a.ko} (${a.cn}) 선택`}
        aria-pressed={sel}
        style={{
          gridColumn: String(a.c),
          gridRow: String(a.r),
          cursor: 'pointer',
          borderRadius: 9,
          padding: '6px 7px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'left',
          color: 'inherit',
          font: 'inherit',
          background: sel ? 'rgba(124,93,199,0.30)' : 'rgba(255,255,255,0.035)',
          border: sel ? `1.5px solid ${Z.goldBright}` : '1px solid rgba(199,162,63,0.18)',
          boxShadow: sel ? '0 0 16px rgba(227,195,107,0.3)' : 'none',
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
          {easy ? (
            <TokenLine
              text={a.ko}
              style={{ fontFamily: SANS, fontSize: koFs, fontWeight: 700, color: Z.goldBright, lineHeight: 1.15 }}
            />
          ) : (
            a.stars.map((s, idx) => (
              <span
                key={s}
                style={{
                  fontFamily: SERIF,
                  fontSize: 12 * scale,
                  fontWeight: 700,
                  color: idx === 0 ? Z.goldBright : 'rgba(255,255,255,0.82)',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            ))
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ lineHeight: 1.05, minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 12 * scale, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>{a.cn}</div>
            <TokenLine
              text={easy ? koStars : a.ko}
              style={{ fontFamily: SANS, fontSize: starFs, color: 'rgba(255,255,255,0.55)', lineHeight: 1.25 }}
            />
          </div>
          <Brightness b={a.br} sm />
        </div>
      </button>
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gridTemplateRows: 'repeat(4,1fr)',
        gap: 5,
        aspectRatio: '1/1',
        width: '100%',
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 14,
        padding: 6,
        border: '1px solid rgba(199,162,63,0.22)',
      }}
    >
      {list.map(cell)}
      <div
        style={{
          gridColumn: '2 / 4',
          gridRow: '2 / 4',
          border: '1px dashed rgba(199,162,63,0.4)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          background: 'radial-gradient(circle, rgba(124,93,199,0.18), transparent)',
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 30 * scale, color: Z.goldBright, fontWeight: 700 }}>命</div>
        {centerLine && (
          <div
            style={{
              fontFamily: SANS,
              fontSize: 10 * scale,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {centerLine}
          </div>
        )}
      </div>
    </div>
  );
}