'use client';

// components/ziwei/premium/FullReadingSection.tsx — ① 12궁 전체 상세 풀이 (회원 전용)
// TODO: 12궁 각 자리의 상세 풀이(정적 detail + AI 풀이)를 한 화면에 통합 노출.
//   - areas를 순회하며 각 궁의 상세 풀이 카드/아코디언 렌더
//   - chartId로 /api/ai/chat 결과를 묶어 보여주거나 palace 상세로 연결
import type { Area } from '@/lib/ziwei-types';
import { PremiumPlaceholder } from './PremiumPlaceholder';

export interface PremiumFeatureProps {
  chartId?: string;
  areas?: Area[];
}

export function FullReadingSection(_props: PremiumFeatureProps) {
  return (
    <PremiumPlaceholder
      icon="🗂️"
      title="12궁 전체 상세 풀이"
      note="열두 자리(命·財·官·夫妻 …)의 상세 풀이를 한곳에서 볼 수 있도록 준비 중이에요."
    />
  );
}
