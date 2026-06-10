'use client';

// components/ui/Plate.tsx — the square 명반 plate (4×4, dark + gold)
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { Brightness } from '@/components/ziwei/atoms';
import type { Area } from '@/lib/ziwei-types';

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
            <span style={{ fontFamily: SANS, fontSize: 11.5 * scale, fontWeight: 700, color: Z.goldBright, lineHeight: 1.15 }}>
              {a.ko}
            </span>
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
                }}
              >
                {s}
              </span>
            ))
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontFamily: SERIF, fontSize: 12 * scale, color: '#fff', fontWeight: 700 }}>{a.cn}</div>
            <div style={{ fontFamily: SANS, fontSize: 9.5 * scale, color: 'rgba(255,255,255,0.5)' }}>
              {easy ? a.stars.join('·') : a.ko}
            </div>
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