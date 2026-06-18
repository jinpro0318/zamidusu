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
    { key: 'deep', icon: '🔮', title: '깊은 풀이', desc: '궁별 풀이를 하나로 연결한 종합 소견 · 인생 흐름과 전략까지', href: `/chart/${cid}/deep` },
    { key: 'full', icon: '🗂️', title: '12궁 전체 상세 풀이', desc: '열두 자리를 모두 깊이 있게', href: `/chart/${cid}/ai` },
    { key: 'timeline', icon: '📈', title: '대운·세운 타임라인', desc: '시기별 운의 흐름을 한눈에', href: `/chart/${cid}/timeline` },
    { key: 'compat', icon: '💞', title: '궁합·인연 분석', desc: '상대와의 인연을 명반으로 비교', href: '/compatibility' },
    { key: 'alert', icon: '🔔', title: '월간 운세 알림', desc: '매달 내 운세를 챙겨드려요', href: '/mypage' },
  ];
}

// 깊은풀이 카드 식별 — 결제(PAID) 기준 잠금. (다른 카드는 로그인 기준)
const DEEP_KEY = 'deep';

export function PremiumSection({
  loggedIn,
  isPaid = false,
  chartId,
  onSelect,
}: {
  /** 프리미엄 접근 권한(로그인). 카드 잠금 표시·CTA 문구 결정에만 사용. */
  loggedIn: boolean;
  /** 이 명반의 깊은풀이 결제(PAID) 여부 — 깊은풀이 카드 잠금 판정. */
  isPaid?: boolean;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 17, fontWeight: 800, color: Z.ink, letterSpacing: '-0.01em' }}>
            {loggedIn ? '내게 맞는 깊은 풀이' : '가입하면 더 깊은 풀이가 열려요'}
          </h2>
          {/* 유료 영역 표시 — 결제 전에만 노출(과하지 않게, 보라 톤) */}
          {!isPaid && (
            <span
              style={{
                fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: Z.p600,
                background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 999, padding: '2px 8px',
              }}
            >
              유료 콘텐츠
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {features.map((f) => {
          const isDeep = f.key === DEEP_KEY;
          // 깊은풀이 카드는 결제(PAID) 기준 잠금, 나머지는 로그인 기준 잠금.
          const locked = isDeep ? !isPaid : !loggedIn;
          // 깊은풀이도 액션 라벨은 다른 카드와 동일하게 "보러 가기 →"로 통일(가격은 보조문구로 분리).
          const cta = !isDeep && !loggedIn ? '가입하고 보기 →' : '보러 가기 →';
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onSelect(f.href)}
              aria-label={locked ? `${f.title} — 잠김` : f.title}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 5,
                textAlign: 'left', cursor: 'pointer',
                background: Z.white, border: `1px solid ${isDeep && !isPaid ? Z.p100 : Z.line}`,
                borderRadius: 16, padding: '13px 13px 14px', minHeight: 100,
              }}
            >
              {/* 준비중 배지 — 모든 카드(아직 정식 오픈 전) */}
              <span
                style={{
                  position: 'absolute', top: 10, right: 10,
                  fontFamily: SANS, fontSize: 10, fontWeight: 700, color: Z.p600,
                  background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 999, padding: '2px 7px',
                }}
              >
                준비중
              </span>
              <span aria-hidden style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, lineHeight: 1.3, paddingRight: 48 }}>{f.title}</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink2, lineHeight: 1.45 }}>{f.desc}</span>
              {/* 하단 위계: [보조문구(유료·미결제 시)] → [보러 가기 →] */}
              <span style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {isDeep && !isPaid && (
                  <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: Z.ink3 }}>
                    890원 · 구매 후 열람
                  </span>
                )}
                <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: Z.p600 }}>{cta}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
