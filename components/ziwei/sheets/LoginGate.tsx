'use client';

// components/sheets/LoginGate.tsx — value-add 기능 로그인 게이트 (soft bottom sheet)
// 실제 지원하는 provider만 노출: Google(모달에서 바로 OAuth) + 이메일(/sign-in 폼).
// Kakao 로그인은 Supabase에서 비활성이라 제거(카카오톡 '공유'는 별개 기능으로 유지).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { GoogleBtn } from '@/components/ziwei/atoms';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { authCallbackUrl, resolveLoginNext } from '@/lib/site-url';
import { detectInAppBrowser, openInExternalBrowser, INAPP_GUIDE_MESSAGE } from '@/lib/inapp-browser';
import type { GateState } from '@/lib/ziwei-types';

const COPY: Record<string, { badge: string; t: string; s: string }> = {
  ai: { badge: 'AI 심층 풀이', t: '더 깊은 풀이, 보여드릴게요', s: '가입하면 전체 풀이를 바로 볼 수 있어요.' },
  save: { badge: '명반 저장', t: '이 명반을 저장할까요?', s: '로그인하면 언제든 다시 꺼내볼 수 있어요.' },
  share: { badge: '친구 공유', t: '친구에게 공유하기', s: '가입하면 공유 링크가 바로 만들어져요.' },
  detail: { badge: '상세 풀이', t: '여기서부터는 회원 전용이에요', s: '가입하면 12궁 상세 풀이·대운 타임라인·AI 해석이 모두 열려요.' },
};

export function LoginGate({
  gate,
  onClose,
  callbackUrl,
}: {
  gate: GateState | null;
  onClose: () => void;
  /** 로그인 성공 후 돌아올 경로 (미지정 시 로그인 직전 현재 경로로 복귀). */
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!gate) return null;
  const c = COPY[gate.reason] || { badge: '', t: '3초 만에 시작하기', s: '' };

  // Google은 모달에서 바로 OAuth 실행 (페이지 왕복 제거).
  const handleGoogle = async () => {
    // 인앱 브라우저(카카오톡 등)에서는 구글 OAuth가 차단된다(disallowed_useragent).
    // → 외부 브라우저로 로그인 페이지를 열어 거기서 로그인하도록 유도.
    if (detectInAppBrowser()) {
      const signInUrl = `${window.location.origin}/sign-in?next=${encodeURIComponent(resolveLoginNext(callbackUrl))}`;
      if (!openInExternalBrowser(signInUrl)) {
        toast.error(INAPP_GUIDE_MESSAGE);
      }
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authCallbackUrl(resolveLoginNext(callbackUrl)),
        },
      });
      if (error) throw error;
      // 성공 시 Google로 리다이렉트되므로 별도 처리 불필요.
    } catch (e: any) {
      toast.error(e?.message ?? '구글 로그인 실패');
      setLoading(false);
    }
  };

  // 이메일은 /sign-in 폼으로 (이메일/비밀번호 입력 + 회원가입 탭 제공).
  const goEmail = () => router.push(`/sign-in?next=${encodeURIComponent(resolveLoginNext(callbackUrl))}`);

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
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          aria-label="구글로 로그인 시작"
          aria-busy={loading}
          style={{ all: 'unset', display: 'block', width: '100%', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          <GoogleBtn>Google로 계속하기</GoogleBtn>
        </button>
        <button
          type="button"
          onClick={goEmail}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 10,
            border: `1.5px solid ${Z.line}`,
            background: Z.white,
            cursor: 'pointer',
            borderRadius: 13,
            padding: '13px 0',
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 600,
            color: Z.ink,
          }}
        >
          이메일로 계속하기
        </button>
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
