'use client';

// screens/Result.tsx — 메인 결과 화면 (명반 차트 + 12영역 통합 스크롤 페이지)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { Plate } from '@/components/ziwei/Plate';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { PremiumSection } from '@/components/ziwei/premium/PremiumSection';
import { UncertainTimeBadge } from '@/components/ziwei/UncertainTimeBadge';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { AREA_INFO } from '@/data/areaInfo';
import { annotateStar, annotatePalace } from '@/lib/glossary';
import type { Area, Nav } from '@/lib/ziwei-types';
import { isTossEnabled, itemFromHref } from '@/lib/toss';

interface ResultProps {
  nav: Nav;
  areas?: Area[];
  subjectName?: string;
  birthLabel?: string;
  loggedIn?: boolean;
  /** 출생 시간 불확실(모름/추정) — 상단 참고용 배지 */
  timeUncertain?: boolean;
  /** 이 명반의 깊은풀이 결제(PAID) 여부 */
  isPaid?: boolean;
  /** 공유 링크 발급에 사용할 명반 id */
  chartId?: string;
}

export function Result({ nav, areas, subjectName, birthLabel, timeUncertain = false, chartId }: ResultProps) {
  const router = useRouter();
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const [showAll, setShowAll] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [plateSel, setPlateSel] = useState('命宮');

  // 유료 풀이 선택 → 토스 결제 페이지로 이동.
  //   토스 키가 없으면(승인 대기) 결제 화면 대신 준비 중 안내만 노출.
  const handlePremiumSelect = (href: string) => {
    if (!chartId || !isTossEnabled) {
      showToast('유료 풀이는 결제 준비 중이에요. 곧 열어드릴게요!');
      return;
    }
    router.push(`/chart/${chartId}/pay?item=${itemFromHref(href)}`);
  };

  // 궁 상세(AI 풀이) 페이지로 바로 이동.
  const openPalace = (key: string) => router.push(nav.hrefFor('detail', { key }));

  const sixKeys = ['命宮', '夫妻宮', '財帛宮', '官祿宮', '疾厄宮', '田宅宮'];
  const list = showAll
    ? allAreas
    : allAreas.filter((a) => sixKeys.includes(a.cn)).sort((a, b) => sixKeys.indexOf(a.cn) - sixKeys.indexOf(b.cn));
  const soul = allAreas.find((a) => a.cn === '命宮') ?? allAreas[0];
  const plateCur = allAreas.find((a) => a.cn === plateSel) ?? soul;

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes zmds-scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        /* "상세 풀이 보기" 전용 CTA — 모달의 "AI 상세 풀이 전체 보기" 버튼과 동일한
           진한 세로 보라(p500→p700). 두 버튼 모두 같은 토큰을 공유한다. */
        .detail-cta {
          color: #fff;
          border: none;
          background: linear-gradient(180deg, ${Z.p500}, ${Z.p700});
          box-shadow: 0 4px 14px rgba(94,71,160,0.3);
          transition: filter .15s ease, box-shadow .15s ease;
        }
        .detail-cta:hover { filter: brightness(1.07); box-shadow: 0 6px 18px rgba(94,71,160,0.45); }
        .detail-cta:active { filter: brightness(1.03); box-shadow: 0 3px 10px rgba(94,71,160,0.4); }
      `}</style>

      {/* ── 통합 다크 패널: 헤더 + 명반 차트 ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(175deg, ${Z.p900} 0%, ${Z.p850} 55%, ${Z.p800} 100%)`,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <StarField count={40} gold={5} seed={9} />

        {/* 상단 액션 바: 저장·공유만 우측 정렬 */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 'calc(env(safe-area-inset-top) + 14px) 18px 0' }}>
          <button
            onClick={() => nav.requireLogin('save', () => showToast('명반을 저장했어요'))}
            style={{
              fontFamily: SANS, fontSize: 12.5, color: '#fff', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '7px 13px', cursor: 'pointer',
            }}
          >
            저장
          </button>
          <button
            onClick={() => setShare(true)}
            style={{
              fontFamily: SANS, fontSize: 12.5, color: Z.ink, fontWeight: 700,
              border: 'none', background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
              borderRadius: 18, padding: '7px 13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 4px 12px rgba(199,162,63,0.35)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a3 3 0 10-2.8-4M6 15a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 10-2.8-4M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke={Z.ink} strokeWidth="2" strokeLinecap="round" />
            </svg>
            공유
          </button>
        </div>

        {/* 명반 차트 영역 */}
        <div style={{ position: 'relative', padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: SERIF,
              // 모바일~데스크탑 반응형 (text-2xl~3xl 범위)
              fontSize: 'clamp(24px, 6.4vw, 30px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#fff',
            }}
          >
            내 명반 <span style={{ color: Z.goldBright }}>차트</span>
          </div>
          {/* 출생정보 — 제목 바로 아래 중앙 (제목과의 간격 정리) */}
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em', marginTop: -5 }}>
            {subjectName ? `${subjectName} · ` : ''}{birthLabel ?? ''}
          </div>
          <Plate selKey={plateSel} onSel={setPlateSel} easy={true} areas={allAreas} />
          {/* 선택 궁 요약 카드 — 탭하면 곧바로 궁 상세(AI 풀이) 페이지로 이동 */}
          <button
            type="button"
            onClick={() => openPalace(plateSel)}
            aria-label={`${plateCur.ko} (${plateCur.cn}) 상세 풀이 보기`}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(227,195,107,0.22)',
              borderRadius: 14, padding: '11px 14px', display: 'flex', gap: 12, alignItems: 'center',
              color: 'inherit', textAlign: 'left', cursor: 'pointer', width: '100%',
            }}
          >
            <AreaIcon h={plateCur.h} size={42} sel />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff' }}>{plateCur.ko}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13, color: Z.p300 }}>{annotatePalace(plateCur.cn)}</span>
                <Brightness b={plateCur.br} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: Z.goldBright, margin: '2px 0' }}>
                {plateCur.stars.length > 0
                  ? plateCur.stars.map((s) => `★${annotateStar(s)}`).join(' · ')
                  : '공궁(空宮 — 주성이 없는 자리)'}
              </div>
              {plateCur.subStars && plateCur.subStars.length > 0 && (
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: Z.p300, margin: '0 0 2px' }}>
                  {plateCur.subStars.map(annotateStar).join(' · ')}
                </div>
              )}
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>{plateCur.line}</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }} aria-hidden>
              <path d="M1 1l6 6-6 6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* 스크롤 안내 — 다크 패널 하단에 배치해 확실히 보이도록 */}
          <div
            aria-hidden
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              animation: 'zmds-scroll-hint 1.6s ease-in-out infinite',
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>
              아래로 스크롤하면 12개 영역 풀이가 있어요
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke={Z.goldBright} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {timeUncertain && (
        <div style={{ padding: '12px 18px 0' }}>
          <UncertainTimeBadge />
        </div>
      )}

      {/* ── 12 영역 리스트 (무료 구간 — 잠금/유도 UI 없음) ── */}
      <div style={{ padding: '8px 18px 18px', flex: 1 }}>
        <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, margin: '6px 4px 12px' }}>
          12궁을 <b style={{ color: Z.ink }}>내 인생 영역</b>으로 풀었어요 · 눌러서 자세히 보기
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((a) => {
            // headline(=line) + summary(간단 풀이)는 로그인 여부와 무관하게 항상 무료 노출.
            // 상세 풀이는 카드를 열면 나오는 모달의 '상세 풀이' 탭에서만 (로그인 시) 제공.
            const cardInfo = AREA_INFO[a.cn];
            const headline = cardInfo?.headline || a.line;
            return (
              <div
                key={a.cn}
                style={{
                  background: Z.white, border: `1px solid ${a.sel ? Z.p100 : Z.line}`,
                  borderRadius: 18, padding: '13px 14px',
                  boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                }}
              >
                <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <AreaIcon h={a.h} size={44} sel={a.sel} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: Z.ink }}>{a.ko}</span>
                      <span style={{ fontFamily: SERIF, fontSize: 12, color: Z.ink3 }}>{annotatePalace(a.cn)}</span>
                      <Brightness b={a.br} />
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: Z.ink, marginTop: 3, lineHeight: 1.45 }}>
                      {headline}
                    </div>
                    {cardInfo?.summary && (
                      <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 5, lineHeight: 1.55 }}>
                        {cardInfo.summary}
                      </div>
                    )}
                  </div>
                </div>
                {/* 상세 풀이 진입 — 탭하면 권한에 따라 분기:
                    회원/유료 → 궁 상세(AI 풀이) 페이지로 직접 이동, 비로그인 → 가입 바텀시트(복귀 경로 포함) */}
                <button
                  type="button"
                  onClick={() => openPalace(a.cn)}
                  aria-label={`${a.ko} 상세 풀이 보기`}
                  className="detail-cta"
                  style={{
                    marginTop: 11, width: '100%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontFamily: SANS, fontSize: 13.5, fontWeight: 700, borderRadius: 13, padding: '10px 12px',
                  }}
                >
                  상세 풀이 보기
                  <span aria-hidden style={{ fontWeight: 800 }}>→</span>
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowAll((s) => !s)}
          style={{
            width: '100%', marginTop: 12, cursor: 'pointer',
            fontFamily: SANS, fontSize: 14, fontWeight: 600, color: Z.p600,
            background: 'transparent', border: `1.5px dashed ${Z.p100}`,
            borderRadius: 14, padding: '12px',
          }}
        >
          {showAll ? '접기 ▴' : '나머지 6개 영역 더보기 ▾'}
        </button>
      </div>

      {/* ✦ 더 깊이 알아보기 — 테스트 기간: 결제 없이 해당 기능 페이지로 바로 이동. */}
      <PremiumSection
        loggedIn={true}
        chartId={chartId}
        onSelect={handlePremiumSelect}
      />

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        showToast={showToast}
        soulStars={allAreas.find((x) => x.cn === '命宮')?.stars}
        chartId={chartId}
        title={subjectName}
      />
      <Toast msg={toast} />
    </div>
  );
}
