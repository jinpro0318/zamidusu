'use client';

// components/ziwei/premium/MonthlyAlertSection.tsx — ④ 월간 운세 알림 (회원 전용)
// TODO: 매달 운세 요약을 생성하고 알림(이메일/푸시) 구독을 관리.
//   - 구독 on/off 토글 + 알림 채널 설정 UI
//   - 월간 운세 생성 잡(스케줄) 및 발송 연동
import type { PremiumFeatureProps } from './FullReadingSection';
import { PremiumPlaceholder } from './PremiumPlaceholder';

export function MonthlyAlertSection(_props: PremiumFeatureProps) {
  return (
    <PremiumPlaceholder
      icon="🔔"
      title="월간 운세 알림"
      note="매달 내 운세 요약을 챙겨 알려주는 구독 기능을 준비 중이에요."
    />
  );
}
