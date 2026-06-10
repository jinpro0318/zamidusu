'use client';

// components/sheets/QASheet.tsx — suggested-question → AI answer (preview + lock when logged out)
import { Z, SERIF, SANS } from '@/theme/tokens';
import { KakaoBtn } from '@/components/ziwei/atoms';
import type { SuggestedQuestion } from '@/lib/ziwei-types';

export function QASheet({
  openQ,
  loggedIn,
  onClose,
  onUnlock,
}: {
  openQ: SuggestedQuestion | null;
  loggedIn: boolean;
  onClose: () => void;
  onUnlock: () => void;
}) {
  if (!openQ) return null;
  const q = openQ.q;
  const a = openQ.a || '';
  const parts = a.split(/(?<=[.!?。])\s+/);
  const preview = parts.slice(0, 1).join(' ');
  const rest = parts.slice(1).join(' ') || '당신의 명반에 맞춘 시기와 흐름, 구체적인 조언까지 단계별로 풀어드려요.';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 155,
        borderRadius: 0, // 모바일 컨테이너에서 자체 코너로 처리
        overflow: 'hidden',
        background: 'rgba(20,14,35,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '80%',
          background: Z.cream,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: '12px 20px 28px',
          overflow: 'auto',
          boxShadow: '0 -12px 44px rgba(0,0,0,0.22)',
          animation: 'sheetUp .26s cubic-bezier(.3,.8,.4,1)',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: Z.line, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(180deg,${Z.p500},${Z.p700})`, display: 'inline-block' }} />
          <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.p600 }}>AI 쉬운 풀이</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: Z.ink, lineHeight: 1.35, marginBottom: 14 }}>{q}</div>
        <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.7 }}>{preview}</div>
        {loggedIn ? (
          <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.7, marginTop: 6 }}>{rest}</div>
        ) : (
          <div style={{ position: 'relative', marginTop: 6 }}>
            <div
              style={{
                filter: 'blur(4px)',
                userSelect: 'none',
                color: Z.ink2,
                fontFamily: SANS,
                fontSize: 14.5,
                lineHeight: 1.7,
                maxHeight: 70,
                overflow: 'hidden',
              }}
            >
              {rest}
            </div>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(251,248,243,0), ${Z.cream})` }} />
          </div>
        )}
        {!loggedIn && (
          <div style={{ marginTop: 14, border: `1.5px solid ${Z.p100}`, background: Z.p50, borderRadius: 16, padding: '14px' }}>
            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink, textAlign: 'center', marginBottom: 10 }}>
              🔒 전체 풀이는 가입 후 바로 열려요 · 3초면 끝
            </div>
            <button
              type="button"
              onClick={onUnlock}
              aria-label="카카오로 가입하고 전체 풀이 잠금 해제"
              style={{ all: 'unset', display: 'block', width: '100%', cursor: 'pointer' }}
            >
              <KakaoBtn>카카오로 시작하고 전체 풀이 보기</KakaoBtn>
            </button>
          </div>
        )}
        {loggedIn && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 9,
              alignItems: 'center',
              background: Z.white,
              border: `1.5px solid ${Z.p100}`,
              borderRadius: 16,
              padding: '8px 8px 8px 14px',
            }}
          >
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 13.5, color: Z.ink3 }}>이어서 더 물어보기…</span>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M2 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}