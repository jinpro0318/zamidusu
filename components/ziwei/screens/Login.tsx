'use client';

// screens/Login.tsx — Supabase 인증 로직과 결합
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { PrimaryBtn, KakaoBtn, Seg } from '@/components/ziwei/atoms';
import { BackBar, Label, TextInput } from '@/components/ziwei/common';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Nav } from '@/lib/ziwei-types';
import { toast } from 'sonner';

export function Login({ nav, callbackUrl }: { nav: Nav; callbackUrl?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<'로그인' | '회원가입'>('로그인');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState<'' | 'email' | 'kakao'>('');

  async function onSubmit() {
    if (!email || !pw) return toast.error('이메일과 비밀번호를 입력해 주세요');
    if (tab === '회원가입' && pw !== pw2) return toast.error('비밀번호가 일치하지 않아요');

    setLoading('email');
    try {
      const supabase = createSupabaseBrowserClient();
      if (tab === '회원가입') {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(callbackUrl ?? '/mypage')}` },
        });
        if (error) throw error;
        toast.success('확인 이메일을 보냈어요. 메일함을 확인해주세요.');
        setTab('로그인');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        router.push(callbackUrl ?? '/mypage');
        router.refresh();
      }
    } catch (e: any) {
      toast.error(translate(e.message ?? '로그인 실패'));
    } finally {
      setLoading('');
    }
  }

  async function onKakao() {
    setLoading('kakao');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(callbackUrl ?? '/mypage')}`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message ?? '카카오 로그인 실패');
      setLoading('');
    }
  }

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <BackBar nav={nav} />
      <div style={{ padding: '4px 24px 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: Z.ink, margin: '4px 0 4px' }}>
          {tab === '로그인' ? '다시 오셨네요' : '처음이신가요?'}
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2, margin: '0 0 22px' }}>
          {tab === '로그인' ? '로그인하고 내 명반을 이어보세요' : '몇 초면 가입 완료 · 명반이 저장돼요'}
        </p>
        <div style={{ marginBottom: 20 }}>
          <Seg options={['로그인', '회원가입']} value={tab} onChange={(v) => setTab(v as '로그인' | '회원가입')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Label req>이메일</Label>
            <TextInput value={email} onChange={setEmail} ph="you@example.com" type="email" />
          </div>
          <div>
            <Label req>비밀번호</Label>
            <TextInput value={pw} onChange={setPw} ph="••••••••" type="password" />
          </div>
          {tab === '회원가입' && (
            <div>
              <Label req>비밀번호 확인</Label>
              <TextInput value={pw2} onChange={setPw2} ph="••••••••" type="password" />
            </div>
          )}
        </div>
        <div style={{ marginTop: 18 }}>
          <PrimaryBtn onClick={onSubmit} disabled={loading !== ''}>
            {loading === 'email' ? '처리 중…' : tab}
          </PrimaryBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: Z.ink3, fontSize: 13, fontFamily: SANS, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: Z.line }} />
          또는
          <div style={{ flex: 1, height: 1, background: Z.line }} />
        </div>
        <div onClick={onKakao} style={{ opacity: loading === 'kakao' ? 0.6 : 1 }}>
          <KakaoBtn />
        </div>
      </div>
    </div>
  );
}

function translate(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (/User already registered/i.test(msg)) return '이미 가입된 이메일이에요.';
  if (/Password should be at least/i.test(msg)) return '비밀번호는 최소 6자 이상이어야 해요.';
  return msg;
}
