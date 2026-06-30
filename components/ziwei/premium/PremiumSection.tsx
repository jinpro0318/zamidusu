'use client';

// components/ziwei/premium/PremiumSection.tsx
// "✦ 더 깊이 알아보기" — 무료 구간 아래에서 확장 기능들을 소개하는 섹션.
//   - 테스트 기간: 결제 없이 실제 기능을 바로 체험. 탭 시 해당 기능 페이지로 이동(비로그인은 로그인 유도).
import { Z, SANS, SERIF } from '@/theme/tokens';

export interface PremiumFeature {
  key: string;
  icon: string;
  title: string;
  desc: string;
  /** 활성화 시 이동할 내부 경로 (기존 라우트 재사용) */
  href: string;
}

// "궁합·인연 분석" + "재회운 분석" 두 가지만 운영.
export function premiumFeatures(chartId?: string): PremiumFeature[] {
  const cid = chartId ?? '';
  return [
    { key: 'compat',  icon: '💞', title: '궁합·인연 분석',  desc: '상대와의 인연을 명반으로 비교', href: cid ? `/compatibility?from=${cid}` : '/compatibility' },
    { key: 'reunion', icon: '🌙', title: '재회운 분석',   desc: '헤어진 인연과의 재회 가능성과 시기', href: `/chart/${cid}/reunion` },
  ];
}

export function PremiumSection({
  loggedIn,
  chartId,
  onSelect,
}: {
  /** 로그인 여부 — CTA 문구 결정용. */
  loggedIn: boolean;
  chartId?: string;
  /** 카드 탭 → 상위에서 분기(이동/로그인 유도) */
  onSelect: (href: string) => void;
}) {
  const features = premiumFeatures(chartId);
  return (
    <section style={{ padding: '8px 18px 30px' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: Z.p600, letterSpacing: '0.06em' }}>
          ✦ 더 깊이 알아보기
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 17, fontWeight: 800, color: Z.ink, letterSpacing: '-0.01em' }}>
            {loggedIn ? '내게 맞는 더 깊은 풀이' : '가입하면 더 깊은 풀이가 열려요'}
          </h2>
          <span style={{ flexShrink: 0, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: Z.p600, background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 999, padding: '3px 9px' }}>
            유료 회원 전용
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {features.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelect(f.href)}
            aria-label={f.title}
            style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 5,
              textAlign: 'left', cursor: 'pointer',
              background: Z.white, border: `1px solid ${Z.line}`,
              borderRadius: 16, padding: '13px 13px 14px', minHeight: 100,
            }}
          >
            <span aria-hidden style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, lineHeight: 1.3 }}>{f.title}</span>
            <span style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink2, lineHeight: 1.45 }}>{f.desc}</span>
            <span style={{ marginTop: 'auto', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: Z.p600 }}>
              {loggedIn ? '보기 →' : '가입하고 보기 →'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
