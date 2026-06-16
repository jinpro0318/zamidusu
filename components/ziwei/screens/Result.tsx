'use client';

// screens/Result.tsx — 메인 결과 화면 (명반 차트 + 12영역 통합 스크롤 페이지)
import { useEffect, useRef, useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { Plate } from '@/components/ziwei/Plate';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { LoginGate } from '@/components/ziwei/sheets/LoginGate';
import { PalaceModal } from '@/components/ziwei/sheets/PalaceModal';
import { JoinBottomSheet } from '@/components/ziwei/sheets/JoinBottomSheet';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { AREA_INFO } from '@/data/areaInfo';
import { starWithHanja } from '@/lib/star-names';
import type { Area, GateState, Nav } from '@/lib/ziwei-types';

interface ResultProps {
  nav: Nav;
  areas?: Area[];
  subjectName?: string;
  birthLabel?: string;
  loggedIn?: boolean;
  /** 공유 링크 발급에 사용할 명반 id */
  chartId?: string;
}

export function Result({ nav, areas, subjectName, birthLabel, loggedIn = true, chartId }: ResultProps) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const [showAll, setShowAll] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [plateSel, setPlateSel] = useState('命宮');
  const [gate, setGate] = useState<GateState | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // 탭한 궁의 풀이 모달 (cn key). null이면 닫힘.
  const [modalKey, setModalKey] = useState<string | null>(null);

  // 비회원 가입 바: "12영역 풀이" 섹션에 들어왔을 때만 노출 + X로 세션 동안 닫힘.
  const joinSectionRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [barDismissed, setBarDismissed] = useState(false);

  // 세션 동안 한 번 닫았는지 복원 (클라이언트에서만)
  useEffect(() => {
    try {
      if (sessionStorage.getItem('joinBarDismissed') === '1') setBarDismissed(true);
    } catch {}
  }, []);

  // 풀이 섹션 진입/이탈을 관찰해 바 노출 토글. 로그인·닫힘 상태면 관찰 안 함.
  useEffect(() => {
    if (loggedIn || barDismissed) {
      setBarVisible(false);
      return;
    }
    const el = joinSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setBarVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loggedIn, barDismissed]);

  const dismissJoinBar = () => {
    setBarDismissed(true);
    setBarVisible(false);
    try {
      sessionStorage.setItem('joinBarDismissed', '1');
    } catch {}
  };

  const modalArea = modalKey ? allAreas.find((x) => x.cn === modalKey) ?? null : null;
  const modalInfo = (modalKey && AREA_INFO[modalKey]) || { headline: '', summary: '', detail: '' };

  // 상세 풀이 게이트 → 회원가입 모달(LoginGate) 오픈. 로그인 후 해당 궁 상세로 복귀.
  // 궁 모달을 닫고 게이트를 띄워야 z-index 충돌 없이 게이트가 위로 올라온다.
  const openJoinGate = (key?: string) => {
    setModalKey(null);
    setPendingHref(key ? nav.hrefFor('detail', { key }) : null);
    setGate({ reason: 'detail', onSuccess: null });
  };

  // 비회원이 공유를 누르면 공유 시트 대신 가입 모달(게이트)로 유도. 로그인 후 이 명반으로 복귀.
  const openShareGate = () => {
    setPendingHref(nav.hrefFor('result'));
    setGate({ reason: 'share', onSuccess: null });
  };

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
            onClick={() => (loggedIn ? setShare(true) : openShareGate())}
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
          <div style={{ textAlign: 'center', fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#fff' }}>
            내 명반 차트
          </div>
          {/* 출생정보 — 제목 바로 아래 중앙 */}
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: -4 }}>
            {subjectName ? `${subjectName} · ` : ''}{birthLabel ?? ''}
          </div>
          <Plate selKey={plateSel} onSel={setPlateSel} easy={true} areas={allAreas} />
          {/* 선택 궁 요약 카드 — 탭하면 풀이 모달 오픈 */}
          <button
            type="button"
            onClick={() => setModalKey(plateSel)}
            aria-label={`${plateCur.ko} (${plateCur.cn}) 풀이 보기`}
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
                <span style={{ fontFamily: SERIF, fontSize: 13, color: Z.p300 }}>{plateCur.cn}</span>
                <Brightness b={plateCur.br} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: Z.goldBright, margin: '2px 0' }}>
                {plateCur.stars.length > 0
                  ? plateCur.stars.map((s) => `★${starWithHanja(s)}`).join(' · ')
                  : '공궁(空宮)'}
              </div>
              {plateCur.subStars && plateCur.subStars.length > 0 && (
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: Z.p300, margin: '0 0 2px' }}>
                  {plateCur.subStars.join(' · ')}
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

      {/* ── 12 영역 리스트 ── */}
      {/* 비회원: 접이식 가입 바(기본 얇은 바)에 가리지 않도록 하단 여유 패딩.
          펼치면 일시적으로 콘텐츠를 덮지만 사용자가 접을 수 있음. */}
      <div ref={joinSectionRef} style={{ padding: loggedIn ? '8px 18px 26px' : '8px 18px 92px', flex: 1 }}>
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
              <button
                key={a.cn}
                type="button"
                onClick={() => setModalKey(a.cn)}
                aria-label={`${a.ko} (${a.cn}) 풀이 보기`}
                style={{
                  display: 'flex', gap: 13, alignItems: 'flex-start',
                  background: Z.white, border: `1px solid ${a.sel ? Z.p100 : Z.line}`,
                  borderRadius: 18, padding: '13px 14px',
                  boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                  color: 'inherit', textAlign: 'left', cursor: 'pointer', width: '100%',
                }}
              >
                <AreaIcon h={a.h} size={44} sel={a.sel} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: Z.ink }}>{a.ko}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 12, color: Z.ink3 }}>{a.cn}</span>
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
                <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0, alignSelf: 'center' }} aria-hidden>
                  <path d="M1 1l6 6-6 6" stroke={Z.ink3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
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

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        showToast={showToast}
        soulStars={allAreas.find((x) => x.cn === '命宮')?.stars}
        chartId={chartId}
        title={subjectName}
      />
      {/* 궁 풀이 모달 — 간단 풀이 항상 노출. 상세 풀이/AI 상세 화면은 테스트 기간 게스트도 접근 가능.
          (onOpenFull은 modalKey만 있으면 전달하고, 버튼 노출은 PalaceModal 내부 분기가 제어) */}
      <PalaceModal
        area={modalArea}
        info={modalInfo}
        loggedIn={loggedIn}
        onClose={() => setModalKey(null)}
        onJoin={() => openJoinGate(modalKey ?? undefined)}
        onOpenFull={modalKey ? () => nav.go('detail', { key: modalKey }) : undefined}
      />

      {/* 비회원 전용 — 풀이 섹션 진입 시 등장하는 가입 유도 바텀시트.
          닫기(X)/이탈 시에도 slide-down 퇴장이 보이도록 마운트는 유지하고 visible로만 제어. */}
      {!loggedIn && (
        <JoinBottomSheet
          visible={barVisible}
          onJoin={() => openJoinGate()}
          onLogin={() => openJoinGate()}
          onClose={dismissJoinBar}
        />
      )}

      <LoginGate
        gate={gate}
        onClose={() => setGate(null)}
        callbackUrl={pendingHref ?? '/'}
      />
      <Toast msg={toast} />
    </div>
  );
}
