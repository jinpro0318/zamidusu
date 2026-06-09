'use client';

// components/sheets/ShareSheet.tsx — Kakao "친구에게 공유" bottom sheet
import type { ReactNode } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { SHARE_URL, shareKakao, copyLink } from '@/lib/share/kakao';

type ShowToast = (msg: string) => void;

function IconBtn({
  label,
  bg,
  fg = '#fff',
  children,
  onClick,
}: {
  label: string;
  bg: string;
  fg?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        padding: 0,
        flex: 1,
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(36,26,61,0.12)',
        }}
      >
        {children}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 12, color: Z.ink2, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

export function ShareSheet({ open, onClose, showToast }: { open: boolean; onClose: () => void; showToast: ShowToast }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        borderRadius: 0, // 모바일 컨테이너에서 자체 코너로 처리
        overflow: 'hidden',
        background: 'rgba(20,14,35,0.5)',
        WebkitBackdropFilter: 'blur(2px)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: Z.cream,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: '12px 20px 34px',
          boxShadow: '0 -12px 44px rgba(0,0,0,0.22)',
          animation: 'sheetUp .26s cubic-bezier(.3,.8,.4,1)',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: Z.line, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: Z.ink, marginBottom: 14 }}>친구에게 공유하기</div>

        {/* preview card */}
        <div
          style={{
            display: 'flex',
            gap: 13,
            alignItems: 'center',
            background: Z.white,
            border: `1px solid ${Z.line}`,
            borderRadius: 16,
            padding: 12,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              flexShrink: 0,
              background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(227,195,107,0.4)',
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: Z.goldBright }}>命</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: Z.ink }}>내 자미두수 명반</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 2 }}>명궁 紫微·天府 · 12 영역 해석</div>
            <div
              style={{
                fontFamily: SANS,
                fontSize: 11.5,
                color: Z.p600,
                marginTop: 3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {SHARE_URL}
            </div>
          </div>
        </div>

        {/* kakao primary */}
        <button
          onClick={() => shareKakao(showToast)}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 15,
            cursor: 'pointer',
            padding: '15px 18px',
            fontFamily: SANS,
            fontSize: 16,
            fontWeight: 700,
            background: Z.kakao,
            color: '#3C1E1E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            boxShadow: '0 8px 22px rgba(254,229,0,0.4)',
            marginBottom: 18,
          }}
        >
          <svg width="21" height="20" viewBox="0 0 20 19" fill="none">
            <path
              d="M10 1C4.9 1 .8 4.2.8 8.1c0 2.5 1.7 4.7 4.2 6L4 17.9c-.1.3.2.5.5.4l4.3-2.8c.4 0 .8.1 1.2.1 5.1 0 9.2-3.2 9.2-7.5S15.1 1 10 1z"
              fill="#3C1E1E"
            />
          </svg>
          카카오톡으로 친구에게 공유
        </button>

        {/* other share targets */}
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn label="링크 복사" bg={Z.p600} onClick={() => copyLink(showToast)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6M10 8H8a4 4 0 100 8h2M14 8h2a4 4 0 010 8h-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </IconBtn>
          <IconBtn label="인스타" bg="linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)" onClick={() => showToast('인스타그램 스토리로 공유')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.3" fill="#fff" />
            </svg>
          </IconBtn>
          <IconBtn label="X" bg="#111" onClick={() => showToast('X로 공유')}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff">
              <path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-7-6.2 7H1.6l8.1-9.3L1 2h7.1l4.9 6.5L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
            </svg>
          </IconBtn>
          <IconBtn label="더보기" bg={Z.white} fg={Z.ink} onClick={() => showToast('시스템 공유 시트 열기')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="12" r="2" fill={Z.ink} />
              <circle cx="12" cy="12" r="2" fill={Z.ink} />
              <circle cx="18" cy="12" r="2" fill={Z.ink} />
            </svg>
          </IconBtn>
        </div>
      </div>
    </div>
  );
}