'use client';

// screens/Mypage.tsx — 프로필 + 회원등급 + 업그레이드 + 메뉴 + 저장 명반 + 로그아웃
import Link from 'next/link';
import { useRef, useState, useTransition, type CSSProperties, type ReactNode } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { BackBar } from '@/components/ziwei/common';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import type { Nav } from '@/lib/ziwei-types';

export interface SavedItem {
  id?: string;
  label: string;
  sub: string;
  cn: string;
}

type Plan = 'FREE' | 'PREMIUM' | 'PRO';

const PLAN_BADGE: Record<Plan, { label: string; fg: string; bg: string; bd: string }> = {
  FREE: { label: '무료 회원', fg: Z.ink2, bg: Z.p50, bd: Z.p100 },
  PREMIUM: { label: '프리미엄', fg: '#9C7C1E', bg: 'rgba(199,162,63,0.14)', bd: 'rgba(199,162,63,0.45)' },
  PRO: { label: 'PRO', fg: '#fff', bg: Z.p700, bd: Z.p700 },
};

export function Mypage({
  nav,
  saved: savedProp,
  email,
  nickname = '회원',
  plan = 'FREE',
  joinedAt = '',
  chartCount,
  compatCount = 0,
  onSignOut,
}: {
  nav: Nav;
  saved?: SavedItem[];
  email?: string;
  nickname?: string;
  plan?: Plan;
  joinedAt?: string;
  chartCount?: number;
  compatCount?: number;
  onSignOut?: () => Promise<void> | void;
}) {
  const [toast, showToast] = useToast();
  const [signingOut, startSignOut] = useTransition();
  const savedRef = useRef<HTMLDivElement>(null);
  const [confirmOut, setConfirmOut] = useState(false);

  const saved: SavedItem[] = savedProp ?? [];
  const charts = chartCount ?? saved.length;
  const badge = PLAN_BADGE[plan];
  const initial = (nickname || '회').trim().charAt(0);

  const scrollToSaved = () => savedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 마이페이지 메뉴.
  // 연결 완료: 내 명반 차트(→result/input), 저장한 명반(→리스트 스크롤), 고객센터(→의견 팝업)
  // 미연결("준비 중" 토스트) — 후속 라우트/기능 예정:
  //   TODO(궁합 기록):    /compatibility 기록 목록 페이지 신설 후 nav 연결 (현재 /compatibility/[id]만 존재)
  //   TODO(운세 알림 설정): 알림 설정 화면 + 푸시/이메일 구독 토글 (Notification 모델 신설 필요)
  //   TODO(계정 설정):     /mypage/account — 닉네임/이메일 변경·비밀번호·회원탈퇴
  //   TODO(약관·개인정보): /legal/terms, /legal/privacy 정적 페이지 신설 후 Link 연결
  const menu: { icon: string; label: string; onClick: () => void; sub?: string }[] = [
    {
      icon: '🪐', label: '내 명반 차트',
      onClick: () => (saved[0]?.id ? nav.go('result', { chartId: saved[0].id }) : nav.go('input')),
    },
    { icon: '🗂️', label: '저장한 명반', sub: `${charts}개`, onClick: scrollToSaved },
    // TODO: /compatibility 기록 목록 라우트 연결
    { icon: '💞', label: '궁합 기록', sub: compatCount ? `${compatCount}건` : undefined, onClick: () => showToast('궁합 기록 (준비 중)') },
    // TODO: 운세 알림 설정 화면 연결
    { icon: '🔔', label: '운세 알림 설정', onClick: () => showToast('운세 알림 설정 (준비 중)') },
    // TODO: /mypage/account 계정 설정 화면 연결
    { icon: '⚙️', label: '계정 설정', onClick: () => showToast('계정 설정 (준비 중)') },
    { icon: '💬', label: '고객센터', onClick: () => window.dispatchEvent(new CustomEvent('open-support')) },
    // TODO: /legal/terms · /legal/privacy 정적 페이지 연결
    { icon: '📄', label: '약관 · 개인정보처리방침', onClick: () => showToast('약관·개인정보처리방침 (준비 중)') },
  ];

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <BackBar nav={nav} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 10px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: Z.ink }}>마이페이지</div>
      </div>

      <div style={{ padding: '8px 18px 36px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ── 프로필 (닉네임 · 이메일 · 회원등급 배지) ── */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: '16px' }}>
          <div
            style={{
              width: 58, height: 58, borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: Z.goldBright, fontFamily: SERIF, fontSize: 24, fontWeight: 700,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: Z.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nickname}</span>
              <span
                style={{
                  flexShrink: 0, fontFamily: SANS, fontSize: 11, fontWeight: 800,
                  color: badge.fg, background: badge.bg, border: `1px solid ${badge.bd}`,
                  borderRadius: 20, padding: '2px 9px',
                }}
              >
                {badge.label}
              </span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email || '이메일 미등록'}</div>
          </div>
        </div>

        {/* ── 프리미엄 업그레이드 카드 (무료 회원 전용) ── */}
        {plan === 'FREE' && (
          <div
            style={{
              position: 'relative', overflow: 'hidden',
              background: `linear-gradient(160deg, ${Z.p850}, ${Z.p700})`,
              border: '1px solid rgba(227,195,107,0.3)', borderRadius: 18, padding: '18px 18px 16px',
            }}
          >
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: Z.goldBright, letterSpacing: '0.04em' }}>PREMIUM</div>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 800, color: '#fff', marginTop: 5, lineHeight: 1.45 }}>
              프리미엄으로 업그레이드
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 1.55 }}>
              12궁 전체 상세 풀이 · 대운 타임라인 · 무제한 AI 해석 · PDF 리포트까지 한 번에.
            </div>
            <button
              onClick={() => showToast('프리미엄 업그레이드 (준비 중)')}
              style={{
                marginTop: 13, width: '100%', cursor: 'pointer', border: 'none', borderRadius: 13, padding: '13px',
                fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: Z.ink,
                background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
                boxShadow: '0 6px 18px rgba(199,162,63,0.4)',
              }}
            >
              프리미엄 업그레이드
            </button>
          </div>
        )}

        {/* ── 메뉴 ── */}
        <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, overflow: 'hidden' }}>
          {menu.map((m, i) => (
            <button
              key={m.label}
              onClick={m.onClick}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${Z.line}`,
                padding: '14px 16px',
              }}
            >
              <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{m.icon}</span>
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: Z.ink }}>{m.label}</span>
              {m.sub && <span style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink3 }}>{m.sub}</span>}
              <svg width="7" height="12" viewBox="0 0 8 14" aria-hidden>
                <path d="M1 1l6 6-6 6" stroke={Z.ink3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* ── 저장한 명반 ── */}
        <div ref={savedRef} style={{ scrollMarginTop: 12 }}>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink, margin: '2px 4px 10px' }}>
            내 명반 <span style={{ color: Z.ink3, fontWeight: 500 }}>({saved.length})</span>
          </div>
          {saved.length === 0 ? (
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, background: Z.white, border: `1px dashed ${Z.p100}`, borderRadius: 16, padding: '20px', textAlign: 'center' }}>
              아직 저장한 명반이 없어요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {saved.map((s, i) => {
                const cardStyle: CSSProperties = {
                  display: 'flex', gap: 13, alignItems: 'center',
                  background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16,
                  padding: '12px 14px', boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                  color: 'inherit', textDecoration: 'none',
                };
                const inner: ReactNode = (
                  <>
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: Z.goldBright, fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                        boxShadow: '0 0 0 1px rgba(227,195,107,0.4)',
                      }}
                    >
                      {s.cn}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink }}>{s.label}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 2 }}>{s.sub}</div>
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" aria-hidden>
                      <path d="M1 1l6 6-6 6" stroke={Z.ink3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                );
                return s.id ? (
                  <Link key={i} href={nav.hrefFor('result', { chartId: s.id })} aria-label={`저장된 명반 열기: ${s.label}, ${s.sub}`} style={cardStyle}>
                    {inner}
                  </Link>
                ) : (
                  <div key={i} style={cardStyle}>{inner}</div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => nav.go('input')}
          style={{
            width: '100%', cursor: 'pointer', border: 'none', borderRadius: 16, padding: '15px',
            fontFamily: SANS, fontSize: 16, fontWeight: 700, color: '#fff',
            background: `linear-gradient(180deg,${Z.p600},${Z.p700})`,
            boxShadow: '0 8px 22px rgba(76,58,124,0.34)',
          }}
        >
          + 새 명반 만들기
        </button>

        {/* ── 하단: 로그아웃 + 가입일/자동로그인 ── */}
        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {confirmOut ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={() => setConfirmOut(false)}
                disabled={signingOut}
                style={{ flex: 1, cursor: 'pointer', border: `1.5px solid ${Z.line}`, background: Z.white, borderRadius: 13, padding: '12px', fontFamily: SANS, fontSize: 14, fontWeight: 600, color: Z.ink2 }}
              >
                취소
              </button>
              <button
                onClick={() => startSignOut(() => { void onSignOut?.(); })}
                disabled={signingOut}
                style={{ flex: 1, cursor: signingOut ? 'default' : 'pointer', border: 'none', background: '#C0463F', borderRadius: 13, padding: '12px', fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#fff' }}
              >
                {signingOut ? '로그아웃 중…' : '로그아웃'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmOut(true)}
              style={{ width: '100%', cursor: 'pointer', border: `1.5px solid ${Z.line}`, background: 'transparent', borderRadius: 13, padding: '13px', fontFamily: SANS, fontSize: 14, fontWeight: 600, color: Z.ink2 }}
            >
              로그아웃
            </button>
          )}
          <div style={{ fontFamily: SANS, fontSize: 12, color: Z.ink3, textAlign: 'center' }}>
            {joinedAt ? `${joinedAt} 가입` : '가입 회원'} · 자동로그인 켜짐
          </div>
        </div>
      </div>

      <Toast msg={toast} />
    </div>
  );
}
