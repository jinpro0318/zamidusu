'use client';

// screens/Onboarding.tsx — entry screen
import Link from 'next/link';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { StarField, PrimaryBtn } from '@/components/ziwei/atoms';
import type { Nav } from '@/lib/ziwei-types';

export function Onboarding({ nav, account }: { nav: Nav; account?: { nickname: string } | null }) {
  return (
    <div
      style={{
        minHeight: '100%',
        position: 'relative',
        background: `linear-gradient(170deg, ${Z.p900} 0%, ${Z.p850} 45%, ${Z.p800} 100%)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StarField count={54} gold={7} />

      {/* 계정명 노출 UI 제거됨(로그인 상태는 유지). 마이페이지 진입은 하단/메뉴 경로 사용. */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,162,63,0.22), transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: 'calc(env(safe-area-inset-top) + 40px) 26px max(34px, env(safe-area-inset-bottom))' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, letterSpacing: 6, color: Z.goldBright, marginBottom: 8 }}>紫微斗數</div>
          <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: '#fff' }}>자미두수</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0 8px' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              position: 'relative',
              background: `radial-gradient(circle at 38% 32%, ${Z.p500}, ${Z.p800})`,
              boxShadow: '0 0 50px rgba(199,162,63,0.3), 0 0 0 1px rgba(227,195,107,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow 3.5s ease-in-out infinite',
            }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 54, fontWeight: 700, color: Z.goldBright }}>命</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.45, margin: 0, letterSpacing: -0.5 }}>
            생년월일시만 알려주세요
            <br />
            당신의 <span style={{ color: Z.goldBright }}>명반</span>을 그려드립니다
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(255,255,255,0.62)', lineHeight: 1.6, marginTop: 14 }}>
            AI가 12궁·14주성을 자동으로 계산하고
            <br />
            어려운 한자 대신 <b style={{ color: '#fff', fontWeight: 600 }}>쉬운 말</b>로 풀어드려요
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
          {['14주성 자동배치', '12 영역 해석', '저장 · 공유'].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: SANS,
                fontSize: 12.5,
                color: Z.p300,
                border: '1px solid rgba(183,164,224,0.3)',
                borderRadius: 20,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <PrimaryBtn gold onClick={() => nav.go('input')}>
            내 명반 만들기
          </PrimaryBtn>
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.66)' }}>
            ✦ 가입 없이 바로 시작 · 결과까지 무료로 확인
          </div>
          {!account && (
            <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 13.5, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              이미 회원이신가요?{' '}
              <Link
                href={nav.hrefFor('login')}
                aria-label="로그인 페이지로 이동"
                style={{
                  color: Z.goldBright,
                  fontWeight: 600,
                  textDecoration: 'none',
                  outlineOffset: 3,
                  borderRadius: 4,
                  padding: '2px 4px',
                }}
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}