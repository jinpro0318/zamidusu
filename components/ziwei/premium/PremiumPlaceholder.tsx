'use client';

// components/ziwei/premium/PremiumPlaceholder.tsx
// 로그인 사용자에게 보여줄 프리미엄 기능 영역의 "공통 빈 컨테이너".
// 실제 콘텐츠 로직이 붙기 전까지 레이아웃 자리를 잡아두는 플레이스홀더.
import type { ReactNode } from 'react';
import { Z, SANS } from '@/theme/tokens';

export function PremiumPlaceholder({
  icon,
  title,
  note,
  children,
}: {
  icon: string;
  title: string;
  note: string;
  /** 실제 구현이 들어올 자리 (있으면 note 대신 렌더) */
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      style={{
        background: Z.white,
        border: `1px solid ${Z.line}`,
        borderRadius: 16,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }} aria-hidden>{icon}</span>
        <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: Z.ink }}>{title}</h3>
      </div>

      {children ?? (
        // 실제 콘텐츠가 붙기 전 빈 상태 자리
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 96,
            borderRadius: 12,
            border: `1.5px dashed ${Z.p100}`,
            background: `linear-gradient(170deg, ${Z.p50}, #fff)`,
            padding: '14px',
            fontFamily: SANS,
            fontSize: 12.5,
            color: Z.ink2,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {note}
        </div>
      )}
    </section>
  );
}
