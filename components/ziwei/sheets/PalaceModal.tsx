'use client';

// components/sheets/PalaceModal.tsx — 궁 탭 시 화면 정중앙에 뜨는 풀이 모달.
// 간단 풀이는 항상 노출, 상세 풀이는 비회원에게 blur + 회원가입 게이트.
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness } from '@/components/ziwei/atoms';
import { starWithHanja } from '@/lib/star-names';
import type { Area, AreaDetail } from '@/lib/ziwei-types';

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
  if (!area) return null;

  // 상세 풀이 본문 — 별 의미 + AI 한 줄 풀이를 묶어 보여줌.
  const detailBody = [info.star, info.ai].filter(Boolean).join('\n\n');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 180,
        background: 'rgba(20,14,35,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${area.ko} 풀이`}
        style={{
          width: '100%',
          maxWidth: 360,
          maxHeight: '82vh',
          overflowY: 'auto',
          background: Z.cream,
          borderRadius: 22,
          boxShadow: '0 18px 60px rgba(0,0,0,0.4)',
          animation: 'modalIn .24s cubic-bezier(.3,.8,.4,1)',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* ── 헤더: 궁 이름 + 주성/보조성 ── */}
        <div
          style={{
            position: 'relative',
            background: `linear-gradient(160deg, ${Z.p900}, ${Z.p800})`,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: '18px 18px 16px',
          }}
        >
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

        {/* ── 본문 ── */}
        <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 간단 풀이 — 회원·비회원 모두 항상 노출 */}
          <section>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, marginBottom: 7, letterSpacing: '0.04em' }}>
              간단 풀이
            </div>
            <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.55, fontWeight: 600 }}>{area.line}</div>
            {info.about && (
              <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, lineHeight: 1.55, marginTop: 5 }}>{info.about}</div>
            )}
          </section>

          {/* 상세 풀이 — 비회원은 blur + 게이트, 회원은 전체 노출 */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, letterSpacing: '0.04em' }}>상세 풀이</span>
              {!loggedIn && <span style={{ fontSize: 12 }}>🔒</span>}
            </div>

            {loggedIn ? (
              <>
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
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
                {/* 흐림 처리된 본문 (미리보기) */}
                <div
                  aria-hidden
                  style={{
                    fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', filter: 'blur(5px)', userSelect: 'none',
                    pointerEvents: 'none', padding: '4px 2px', minHeight: 84,
                  }}
                >
                  {detailBody}
                </div>
                {/* 게이트 오버레이 */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 10, padding: '8px 14px',
                    background: 'linear-gradient(180deg, rgba(251,248,243,0.35), rgba(251,248,243,0.92))',
                  }}
                >
                  <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, textAlign: 'center' }}>
                    🔒 상세 풀이는 회원에게 제공돼요
                  </div>
                  <button
                    onClick={onJoin}
                    style={{
                      cursor: 'pointer', fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink,
                      border: 'none', borderRadius: 13, padding: '11px 18px',
                      background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
                      boxShadow: '0 4px 14px rgba(199,162,63,0.4)',
                    }}
                  >
                    무료 가입하고 상세 풀이 보기
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
