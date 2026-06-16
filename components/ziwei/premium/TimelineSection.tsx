'use client';

// components/ziwei/premium/TimelineSection.tsx — ② 대운·세운 운세 타임라인 (회원 전용)
// TODO: 대운(10년 주기)·세운(연 단위) 흐름을 타임라인으로 시각화.
//   - iztro payload의 대운/유년 데이터를 가공 (lib/iztro/* 참고)
//   - 기존 components/timeline/DecadalTimeline 과 연계하거나 신규 구현
import type { PremiumFeatureProps } from './FullReadingSection';
import { PremiumPlaceholder } from './PremiumPlaceholder';

export function TimelineSection(_props: PremiumFeatureProps) {
  return (
    <PremiumPlaceholder
      icon="📈"
      title="대운·세운 운세 타임라인"
      note="시기별 운의 흐름(대운 10년 · 세운 1년)을 타임라인으로 보여드릴 예정이에요."
    />
  );
}
