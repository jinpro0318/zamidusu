'use client';

// components/ziwei/premium/PremiumSection.tsx
// 차트 결과 페이지 하단의 "프리미엄(회원 전용) 기능" 섹션.
//   - 비로그인: 4개 기능을 "로그인하면 열려요" 잠금 미리보기 카드(제목+한 줄 설명+🔒) 그리드로
//   - 로그인:   각 기능의 실제 컴포넌트 영역(현재는 플레이스홀더)으로 전환
// 로그인 여부는 상위(서버 Supabase 세션)에서 내려온 loggedIn prop 재사용.
import type { ComponentType } from 'react';
import { Z, SANS, SERIF } from '@/theme/tokens';
import type { Area } from '@/lib/ziwei-types';
import { FullReadingSection, type PremiumFeatureProps } from './FullReadingSection';
import { TimelineSection } from './TimelineSection';
import { CompatibilitySection } from './CompatibilitySection';
import { MonthlyAlertSection } from './MonthlyAlertSection';

interface FeatureMeta {
  key: string;
  icon: string;
  title: string;
  desc: string;
  Component: ComponentType<PremiumFeatureProps>;
}

const FEATURES: FeatureMeta[] = [
  { key: 'full', icon: '🗂️', title: '12궁 전체 상세 풀이', desc: '열두 자리를 모두 깊이 있게', Component: FullReadingSection },
  { key: 'timeline', icon: '📈', title: '대운·세운 타임라인', desc: '시기별 운의 흐름을 한눈에', Component: TimelineSection },
  { key: 'compat', icon: '💞', title: '궁합·인연 분석', desc: '상대와의 인연을 명반으로 비교', Component: CompatibilitySection },
  { key: 'alert', icon: '🔔', title: '월간 운세 알림', desc: '매달 내 운세를 챙겨드려요', Component: MonthlyAlertSection },
];

export function PremiumSection({
  loggedIn,
  chartId,
  areas,
  onJoin,
}: {
  loggedIn: boolean;
  chartId?: string;
  areas?: Area[];
  onJoin: () => void;
}) {
  return (
    <section style={{ padding: '4px 18px 26px' }}>
      {/* 섹션 헤더 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: Z.p600, letterSpacing: '0.06em' }}>
          PREMIUM · 회원 전용
        </div>
        <h2 style={{ margin: '3px 0 0', fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: Z.ink, letterSpacing: '-0.01em' }}>
          {loggedIn ? '내 프리미엄 풀이' : '로그인하면 열리는 깊은 풀이'}
        </h2>
      </div>

      {loggedIn ? (
        // 로그인: 실제 컴포넌트 영역 스택 (현재는 플레이스홀더)
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map((f) => (
            <f.Component key={f.key} chartId={chartId} areas={areas} />
          ))}
        </div>
      ) : (
        // 비로그인: 잠금 미리보기 카드 그리드 + 단일 CTA
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FEATURES.map((f) => (
              <LockedFeatureCard key={f.key} icon={f.icon} title={f.title} desc={f.desc} onClick={onJoin} />
            ))}
          </div>
          <button
            type="button"
            onClick={onJoin}
            style={{
              width: '100%', marginTop: 12, cursor: 'pointer',
              fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: Z.ink,
              border: 'none', borderRadius: 14, padding: '13px',
              background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
              boxShadow: '0 6px 18px rgba(199,162,63,0.4)',
            }}
          >
            로그인하고 전체 기능 열기
          </button>
        </>
      )}
    </section>
  );
}

// 비로그인용 잠금 미리보기 카드 — 제목 + 한 줄 설명 + 🔒. 클릭 시 로그인 유도.
function LockedFeatureCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title} — 로그인하면 열려요`}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 5,
        textAlign: 'left', cursor: 'pointer',
        background: Z.white,
        border: `1px solid ${Z.line}`,
        borderRadius: 16,
        padding: '13px 13px 14px',
        minHeight: 96,
      }}
    >
      <span aria-hidden style={{ position: 'absolute', top: 11, right: 12, fontSize: 13, opacity: 0.7 }}>🔒</span>
      <span aria-hidden style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, lineHeight: 1.3, paddingRight: 16 }}>{title}</span>
      <span style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink2, lineHeight: 1.45 }}>{desc}</span>
      <span style={{ marginTop: 'auto', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: Z.p600 }}>로그인하면 열려요</span>
    </button>
  );
}
