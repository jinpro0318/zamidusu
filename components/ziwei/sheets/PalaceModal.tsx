'use client';

// components/sheets/PalaceModal.tsx — 궁 탭 시 화면 하단에서 올라오는 바텀시트.
//   모바일: 하단에 붙는 slide-up 시트(상단만 라운드 + 드래그 핸들 + 아래로 swipe 닫기)
//   데스크탑(>=768px): 기존처럼 중앙 카드 + 페이드
// 간단 풀이는 항상 노출, 상세 풀이는 비회원에게 blur + 회원가입 게이트.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness } from '@/components/ziwei/atoms';
import { starWithHanja } from '@/lib/star-names';
import type { Area, AreaDetail } from '@/lib/ziwei-types';

// 아래로 이 거리(px) 이상 끌어내리면 닫힘
const SWIPE_CLOSE_PX = 90;

export function PalaceModal({
  area,
  info,
  loggedIn,
  onClose,
  onJoin,
  onOpenFull,
}: {
  area: Area | null;
  info: AreaDetail;
  loggedIn: boolean;
  onClose: () => void;
  onJoin: () => void;
  onOpenFull?: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  // onClose 는 부모에서 매 렌더 새 함수로 내려올 수 있어 ref 로 최신값만 참조 (effect 재실행 방지)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 아래로 swipe 중 시트가 따라 내려오는 거리
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // 풀이 탭 — 기본 '간단 풀이'. 열 때마다 초기화.
  const [tab, setTab] = useState<'summary' | 'detail'>('summary');
  const summaryTabRef = useRef<HTMLButtonElement>(null);
  const detailTabRef = useRef<HTMLButtonElement>(null);

  const openKey = area?.cn ?? null;

  // 열림: 시트로 포커스 이동 → ESC/포커스 트랩 → 닫힐 때 트리거로 포커스 복귀 + 배경 스크롤 잠금
  useEffect(() => {
    if (!openKey) return;
    setDragY(0);
    setTab('summary');
    const prevFocus = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    sheet?.focus();

    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && sheet) {
        const f = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null && el.tabIndex !== -1,
        );
        if (f.length === 0) {
          e.preventDefault();
          sheet.focus();
          return;
        }
        const first = f[0];
        const last = f[f.length - 1];
        const act = document.activeElement;
        if (e.shiftKey && (act === first || act === sheet)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && act === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [openKey]);

  // 아래로 swipe 닫기 (헤더 영역을 드래그 핸들로 사용 → 본문 스크롤과 충돌 없음).
  // preventDefault 를 써야 해서 passive:false 네이티브 리스너로 직접 등록.
  useEffect(() => {
    const zone = headerRef.current;
    if (!openKey || !zone) return;
    let startY = 0;
    let active = false;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      active = true;
      setDragging(true);
    };
    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        e.preventDefault();
        setDragY(dy);
      }
    };
    const onEnd = () => {
      if (!active) return;
      active = false;
      setDragging(false);
      setDragY((cur) => {
        if (cur > SWIPE_CLOSE_PX) onCloseRef.current();
        return 0;
      });
    };
    zone.addEventListener('touchstart', onStart, { passive: true });
    zone.addEventListener('touchmove', onMove, { passive: false });
    zone.addEventListener('touchend', onEnd);
    zone.addEventListener('touchcancel', onEnd);
    return () => {
      zone.removeEventListener('touchstart', onStart);
      zone.removeEventListener('touchmove', onMove);
      zone.removeEventListener('touchend', onEnd);
      zone.removeEventListener('touchcancel', onEnd);
    };
  }, [openKey]);

  if (!area) return null;

  // 상세 풀이 본문.
  const detailBody = info.detail;
  const headline = info.headline || area.line;

  // 테스트 기간: 비로그인도 상세 풀이를 실제로 열람할 수 있게 임시 개방.
  // 잠금 배지(🔒)·스타일은 "로그인 기능 표시"용으로 그대로 유지한다.
  // 정식 로그인 게이팅으로 되돌리려면 false 로 바꾸면 된다.
  const TEST_DETAIL_OPEN = true;
  const detailAccessible = loggedIn || TEST_DETAIL_OPEN;
  const showLock = !loggedIn; // 비로그인에게는 잠금 표시(🔒)만 유지

  // 탭 키보드 좌우 이동 (automatic activation).
  const TAB_ORDER: ('summary' | 'detail')[] = ['summary', 'detail'];
  const onTabKey = (e: { key: string; preventDefault: () => void }) => {
    const idx = TAB_ORDER.indexOf(tab);
    let next = idx;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = Math.min(idx + 1, TAB_ORDER.length - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = Math.max(idx - 1, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = TAB_ORDER.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const key = TAB_ORDER[next];
    setTab(key);
    (key === 'summary' ? summaryTabRef : detailTabRef).current?.focus();
  };

  // 탭 버튼 스타일 — variant(보라/골드) + 잠금(비로그인) 분기.
  const tabBtnStyle = (
    active: boolean,
    opt: { variant: 'purple' | 'gold'; locked?: boolean },
  ): CSSProperties => {
    const base: CSSProperties = {
      flex: 1,
      cursor: 'pointer',
      fontFamily: SANS,
      fontSize: 13.5,
      fontWeight: 700,
      borderRadius: 12,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      border: '1px solid transparent',
      transition: 'background .18s ease, color .18s ease, border-color .18s ease',
    };
    if (opt.locked) {
      return {
        ...base,
        background: active ? 'rgba(36,26,61,0.05)' : 'transparent',
        color: Z.ink3,
        border: `1px dashed ${Z.line}`,
      };
    }
    if (!active) {
      return { ...base, background: Z.white, color: Z.ink2, border: `1px solid ${Z.line}` };
    }
    if (opt.variant === 'gold') {
      return {
        ...base,
        background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
        color: Z.ink,
        boxShadow: '0 4px 12px rgba(199,162,63,0.32)',
      };
    }
    return {
      ...base,
      background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
      color: '#fff',
      boxShadow: '0 4px 12px rgba(94,71,160,0.28)',
    };
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{`
        .pm-overlay {
          position: fixed; inset: 0; z-index: 180;
          background: rgba(20,14,35,0.6);
          display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
        }
        .pm-sheet {
          width: 100%;
          max-width: 480px;
          max-height: 88vh;
          overflow-y: auto;
          background: ${Z.cream};
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.35);
          animation: pmSlideUp 0.26s cubic-bezier(0.3,0.8,0.4,1);
          outline: none;
        }
        .pm-grabber {
          position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
          width: 40px; height: 5px; border-radius: 3px;
          background: rgba(255,255,255,0.45);
        }
        @keyframes pmSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes pmFade {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .pm-fadein { animation: pmFadeIn 0.18s ease; }
        @media (min-width: 768px) {
          .pm-overlay { align-items: center; padding: 20px; }
          .pm-sheet {
            max-width: 420px;
            max-height: 82vh;
            border-radius: 22px;
            box-shadow: 0 18px 60px rgba(0,0,0,0.4);
            animation: pmFade 0.24s cubic-bezier(0.3,0.8,0.4,1);
          }
          .pm-grabber { display: none; }
        }
      `}</style>

      <div
        ref={sheetRef}
        className="pm-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${area.ko} 풀이`}
        tabIndex={-1}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.26s cubic-bezier(0.3,0.8,0.4,1)',
        }}
      >
        {/* ── 헤더: 드래그 핸들 + 궁 이름 + 주성/보조성 (헤더 전체가 swipe 드래그 영역) ── */}
        <div
          ref={headerRef}
          style={{
            position: 'relative',
            background: `linear-gradient(160deg, ${Z.p900}, ${Z.p800})`,
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            padding: '20px 18px 16px',
            touchAction: 'pan-y',
          }}
        >
          <div className="pm-grabber" aria-hidden />
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.12)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 5l14 14M19 5L5 19" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <AreaIcon h={area.h} size={50} sel />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{area.ko}</span>
                <span style={{ fontFamily: SERIF, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{area.cn}</span>
                <Brightness b={area.br} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                {area.stars.length > 0 ? (
                  area.stars.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontFamily: SERIF, fontSize: 12, color: Z.goldBright,
                        background: 'rgba(227,195,107,0.15)', border: '1px solid rgba(227,195,107,0.32)',
                        borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap',
                      }}
                    >
                      ★{starWithHanja(s)}
                    </span>
                  ))
                ) : (
                  <span
                    style={{
                      fontFamily: SERIF, fontSize: 12, color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap',
                    }}
                  >
                    空宮
                  </span>
                )}
                {(area.subStars ?? []).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.75)',
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 8, padding: '2px 7px', whiteSpace: 'nowrap',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 본문: [간단 풀이] [상세 풀이] 탭 ── */}
        <div style={{ padding: '14px 18px 20px' }}>
          {/* 탭 버튼 */}
          <div role="tablist" aria-label="풀이 보기 방식" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button
              ref={summaryTabRef}
              type="button"
              role="tab"
              id="pm-tab-summary"
              aria-selected={tab === 'summary'}
              aria-controls="pm-panel-summary"
              tabIndex={tab === 'summary' ? 0 : -1}
              onClick={() => setTab('summary')}
              onKeyDown={onTabKey}
              style={tabBtnStyle(tab === 'summary', { variant: 'purple' })}
            >
              간단 풀이
            </button>
            <button
              ref={detailTabRef}
              type="button"
              role="tab"
              id="pm-tab-detail"
              aria-selected={tab === 'detail'}
              aria-controls="pm-panel-detail"
              aria-disabled={!detailAccessible || undefined}
              aria-label={showLock ? '상세 풀이 (로그인 안내 표시 · 테스트 중 열람 가능)' : undefined}
              tabIndex={tab === 'detail' ? 0 : -1}
              onClick={() => setTab('detail')}
              onKeyDown={onTabKey}
              style={tabBtnStyle(tab === 'detail', { variant: 'gold', locked: showLock })}
            >
              {showLock && <span aria-hidden>🔒</span>}
              상세 풀이
            </button>
          </div>

          {/* 간단 풀이 패널 */}
          {tab === 'summary' && (
            <div
              key="summary"
              className="pm-fadein"
              role="tabpanel"
              id="pm-panel-summary"
              aria-labelledby="pm-tab-summary"
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.55, fontWeight: 600 }}>{headline}</div>
              {info.summary && (
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, lineHeight: 1.65, marginTop: 6 }}>{info.summary}</div>
              )}
              {info.scope && (
                <div style={{ fontFamily: SANS, fontSize: 12, color: Z.p600, lineHeight: 1.5, marginTop: 7, opacity: 0.85 }}>
                  {info.scope}
                </div>
              )}
            </div>
          )}

          {/* 상세 풀이 패널 — 테스트 기간: 비로그인도 전문 노출(잠금 표시는 유지).
              정식 게이팅 복원 시(TEST_DETAIL_OPEN=false) 비로그인은 안내 + 단일 CTA로 전환됨. */}
          {tab === 'detail' && (
            <div
              key="detail"
              className="pm-fadein"
              role="tabpanel"
              id="pm-panel-detail"
              aria-labelledby="pm-tab-detail"
              tabIndex={0}
              style={{ outline: 'none' }}
            >
              {detailAccessible ? (
                <>
                  {showLock && (
                    <div
                      style={{
                        fontFamily: SANS, fontSize: 12, fontWeight: 600, color: Z.p600,
                        background: Z.p50, border: `1px solid ${Z.p100}`,
                        borderRadius: 10, padding: '8px 11px', marginBottom: 11, lineHeight: 1.5,
                      }}
                    >
                      🔓 테스트 기간이라 상세 풀이를 무료로 보여드려요 · 정식 오픈 시 로그인 후 이용
                    </div>
                  )}
                  <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{detailBody}</div>
                  {onOpenFull && (
                    <button
                      onClick={onOpenFull}
                      style={{
                        marginTop: 12, width: '100%', cursor: 'pointer',
                        fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#fff',
                        border: 'none', borderRadius: 13, padding: '12px',
                        background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                        boxShadow: '0 4px 14px rgba(94,71,160,0.3)',
                      }}
                    >
                      AI 상세 풀이 전체 보기 →
                    </button>
                  )}
                </>
              ) : (
                <div
                  style={{
                    borderRadius: 14, border: `1px solid ${Z.line}`, background: Z.white,
                    padding: '20px 16px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 9, textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24 }} aria-hidden>🔒</div>
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink }}>
                    로그인하면 상세 풀이를 볼 수 있어요
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, lineHeight: 1.55 }}>
                    타고난 기질부터 강점·주의점·조언까지, 이 자리의 깊은 풀이를 전해드려요.
                  </div>
                  <button
                    onClick={onJoin}
                    style={{
                      marginTop: 4, cursor: 'pointer',
                      fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink,
                      border: 'none', borderRadius: 13, padding: '11px 20px',
                      background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
                      boxShadow: '0 4px 14px rgba(199,162,63,0.4)',
                    }}
                  >
                    로그인 / 무료 가입
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
