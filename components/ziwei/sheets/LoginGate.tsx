'use client';

// components/sheets/LoginGate.tsx — login gate for value-add features (soft bottom sheet)
import { Z, SERIF, SANS } from '@/theme/tokens';
import { KakaoBtn } from '@/components/ziwei/atoms';
import type { GateState } from '@/lib/ziwei-types';

const COPY: Record<string, { badge: string; t: string; s: string }> = {
  ai: { badge: 'AI 심층 풀이', t: '더 깊은 풀이, 보여드릴게요', s: '카카오로 시작하면 전체 풀이를 바로 볼 수 있어요.' },
  save: { badge: '명반 저장', t: '이 명반을 저장할까요?', s: '로그인하면 언제든 다시 꺼내볼 수 있어요.' },
  share: { badge: '친구 공유', t: '친구에게 공유하기', s: '카카오로 시작하면 공유 링크가 바로 만들어져요.' },
};

export function LoginGate({ gate, onClose, onLogin }: { gate: GateState | null; onClose: () => void; onLogin: () => void }) {
  if (!gate) return null;
  const c = COPY[gate.reason] || { badge: '', t: '카카오로 3초 만에 시작하기', s: '' };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 170,
        borderRadius: 0, // 모바일 컨테이너에서 자체 코너로 처리
        overflow: 'hidden',
        background: 'rgba(20,14,35,0.55)',
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
          padding: '12px 22px 30px',
          boxShadow: '0 -12px 44px rgba(0,0,0,0.22)',
          animation: 'sheetUp .26s cubic-bezier(.3,.8,.4,1)',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: Z.line, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 13 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(227,195,107,0.4)',
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: Z.goldBright }}>命</span>
          </div>
        </div>
        {c.badge && (
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.p600, marginBottom: 5 }}>
            {c.badge} · 3초면 끝
          </div>
        )}
        <div style={{ textAlign: 'center', fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: Z.ink }}>{c.t}</div>
        <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 13.5, color: Z.ink2, margin: '8px 0 20px', lineHeight: 1.55 }}>
          {c.s}
          <br />
          <b style={{ color: Z.ink }}>지금까지 본 명반은 그대로 저장</b>돼요.
        </div>
        <div onClick={onLogin}>
          <KakaoBtn>카카오로 시작하기</KakaoBtn>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {['Google', 'Apple', '이메일'].map((m) => (
            <button
              key={m}
              onClick={onLogin}
              style={{
                flex: 1,
                border: `1.5px solid ${Z.line}`,
                background: Z.white,
                cursor: 'pointer',
                borderRadius: 13,
                padding: '11px 0',
                fontFamily: SANS,
                fontSize: 13.5,
                fontWeight: 600,
                color: Z.ink,
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 14,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: SANS,
            fontSize: 14,
            color: Z.ink3,
          }}
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
}