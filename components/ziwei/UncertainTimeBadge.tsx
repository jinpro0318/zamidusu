import { Z, SANS } from '@/theme/tokens';
import type { CSSProperties } from 'react';

// 출생 시간이 불확실(모름/추정)한 명반의 명반·AI 해석 상단에 띄우는 안내 배지.
export function UncertainTimeBadge({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(176,120,120,0.12)', border: '1px solid rgba(176,120,120,0.35)',
        borderRadius: 10, padding: '8px 11px',
        fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#9A5B5B', lineHeight: 1.5,
        ...style,
      }}
    >
      <span aria-hidden>ⓘ</span>
      <span style={{ color: Z.ink2 }}>출생 시간이 불확실해 참고용 해석이에요. 시간을 알게 되면 더 정확해져요.</span>
    </div>
  );
}
