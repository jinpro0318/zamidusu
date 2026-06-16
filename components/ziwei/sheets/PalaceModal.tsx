'use client';

// components/sheets/PalaceModal.tsx — 궁의 "상세 풀이" 전용 바텀시트.
//   모바일: 하단에 붙는 slide-up 시트(상단만 라운드 + 드래그 핸들 + 아래로 swipe 닫기)
//   데스크탑(>=768px): 기존처럼 중앙 카드 + 페이드
// 간단 풀이는 리스트 카드에 인라인 노출되므로 여기선 다루지 않고, 상세 풀이만 보여준다.
// 진입 게이팅(로그인 잠금)은 카드 버튼이 1차로 담당하지만, 다른 진입점(선택 궁 카드)을
// 위해 모달도 동일 플래그로 게이팅을 유지한다.
import { useEffect, useRef, useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness } from '@/components/ziwei/atoms';
import { annotateStar, annotatePalace } from '@/lib/glossary';
import { TEST_DETAIL_OPEN } from '@/lib/feature-flags';
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

  const openKey = area?.cn ?? null;

  // 열림: 시트로 포커스 이동 → ESC/포커스 트랩 → 닫힐 때 트리거로 포커스 복귀 + 배경 스크롤 잠금
  useEffect(() => {
    if (!openKey) return;
    setDragY(0);
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

  // 테스트 기간: 비로그인도 상세 풀이를 실제로 열람할 수 있게 임시 개방.
  // 잠금 안내는 "로그인 기능 표시"용으로 유지한다. 정식 게이팅 복원은 feature-flags에서.
  const detailAccessible = loggedIn || TEST_DETAIL_OPEN;
  const showLock = !loggedIn; // 비로그인에게는 잠금 표시만 유지

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
                <span style={{ fontFamily: SERIF, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{annotatePalace(area.cn)}</span>
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
                      ★{annotateStar(s)}
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
                    {annotateStar(s)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 본문: 상세 풀이 전용 (간단 풀이는 리스트 카드에 인라인 노출되므로 제외) ── */}
        <div style={{ padding: '14px 18px 20px' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, marginBottom: 10, letterSpacing: '0.04em' }}>
            상세 풀이
          </div>

          {detailAccessible ? (
            <div className="pm-fadein">
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
            </div>
          ) : (
            <div
              className="pm-fadein"
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
      </div>
    </div>
  );
}
