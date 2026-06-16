'use client';

// components/ziwei/premium/CompatibilitySection.tsx — ③ 궁합·인연 분석 (회원 전용)
// TODO: 상대방 명반을 입력/선택해 두 명반을 비교하는 궁합 분석.
//   - 상대 출생정보 입력 → 명반 생성 → 부처궁/대조 분석
//   - 저장된 명반 목록에서 상대 선택하는 플로우 고려
import type { PremiumFeatureProps } from './FullReadingSection';
import { PremiumPlaceholder } from './PremiumPlaceholder';

export function CompatibilitySection(_props: PremiumFeatureProps) {
  return (
    <PremiumPlaceholder
      icon="💞"
      title="궁합·인연 분석"
      note="상대의 명반과 비교해 인연·궁합을 풀어주는 기능을 준비 중이에요."
    />
  );
}
