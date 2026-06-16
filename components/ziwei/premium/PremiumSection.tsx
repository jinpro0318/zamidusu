'use client';

// components/ziwei/premium/PremiumSection.tsx
// "✦ 더 깊이 알아보기" — 무료 구간(차트+간단 풀이) 아래에서 프리미엄 4기능을 "소개"하는 섹션.
//   - 카드는 항상 미리보기로 노출(제목 + 한 줄 설명 + 아이콘). 잠금은 은은하게(위협적이지 않게).
//   - 탭 동작은 상위(Result)가 권한으로 분기(onSelect):
//       회원/유료 → 해당 기능 경로로 이동 / 비로그인 → 가입 바텀시트(복귀 경로 포함).
// TODO(권한): loggedIn 외 유료 구독 플래그(isPremium)로 추가 분기.
// TODO(콘텐츠): 각 기능 페이지(상세풀이/타임라인/궁합/알림)의 실제 로직.
import { Z, SANS, SERIF } from '@/theme/tokens';

export interface PremiumFeature {
  key: string;
  icon: string;
  title: string;
  desc: string;
  /** 활성화 시 이동할 내부 경로 (기존 라우트 재사용) */
  href: string;
}

// 기존 라우트로 매핑: 상세풀이 /chart/[id]/ai, 타임라인 /chart/[id]/timeline,
// 궁합 /compatibility, 월간알림 /mypage
export function premiumFeatures(chartId?: string): PremiumFeature[] {
  const cid = chartId ?? '';
  return [
    { key: 'full', icon: '🗂️', title: '12궁 전체 상세 풀이', desc: '열두 자리를 모두 깊이 있게', href: `/chart/${cid}/ai` },
    { key: 'timeline', icon: '📈', title: '대운·세운 타임라인', desc: '시기별 운의 흐름을 한눈에', href: `/chart/${cid}/timeline` },
    { key: 'compat', icon: '💞', title: '궁합·인연 분석', desc: '상대와의 인연을 명반으로 비교', href: '/compatibility' },
    { key: 'alert', icon: '🔔', title: '월간 운세 알림', desc: '매달 내 운세를 챙겨드려요', href: '/mypage' },
  ];
}

export function PremiumSection({
  loggedIn,
  chartId,
  onSelect,
}: {
  /** 프리미엄 접근 권한(로그인/유료). 카드 잠금 표시·CTA 문구 결정에만 사용. */
  loggedIn: boolean;
  chartId?: string;
  /** 카드 탭 → 상위에서 권한 분기(이동/게이트) */
  onSelect: (href: string) => void;
}) {
  const features = premiumFeatures(chartId);
  return (
    <section style={{ padding: '8px 18px 30px' }}>
      {/* 섹션 헤더 — 무료 구간과 분리되는 "더 깊이 알아보기" 입구 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: Z.p600, letterSpacing: '0.06em' }}>
          ✦ 더 깊이 알아보기
        </div>
        <h2 style={{ margin: '3px 0 0', fontFamily: SERIF, fontSize: 17, fontWeight: 800, color: Z.ink, letterSpacing: '-0.01em' }}>
          {loggedIn ? '내게 맞는 깊은 풀이' : '가입하면 더 깊은 풀이가 열려요'}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {features.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelect(f.href)}
            aria-label={loggedIn ? f.title : `${f.title} — 가입하면 열려요`}
            style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 5,
              textAlign: 'left', cursor: 'pointer',
              background: Z.white, border: `1px solid ${Z.line}`,
              borderRadius: 16, padding: '13px 13px 14px', minHeight: 100,
            }}
          >
            {/* 은은한 잠금 표시 — 비로그인에게만, 작고 옅게 */}
            {!loggedIn && (
              <span aria-hidden style={{ position: 'absolute', top: 11, right: 12, fontSize: 11, opacity: 0.55 }}>🔒</span>
            )}
            <span aria-hidden style={{ fontSize: 20 }}>{f.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, lineHeight: 1.3, paddingRight: 14 }}>{f.title}</span>
            <span style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink2, lineHeight: 1.45 }}>{f.desc}</span>
            <span style={{ marginTop: 'auto', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: Z.p600 }}>
              {loggedIn ? '보러 가기 →' : '가입하고 보기 →'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
