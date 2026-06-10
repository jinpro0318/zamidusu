'use client';

// screens/Result.tsx — 메인 결과 화면 (명반 차트 + 12영역 통합 스크롤 페이지)
import Link from 'next/link';
import { useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField, Seg } from '@/components/ziwei/atoms';
import { Plate } from '@/components/ziwei/Plate';
import { TabBar } from '@/components/ziwei/common';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import type { Area, Nav } from '@/lib/ziwei-types';

interface ResultProps {
  nav: Nav;
  loggedIn: boolean;
  areas?: Area[];
  subjectName?: string;
  birthLabel?: string; // 예: "1990.05.20 · 양력 · 子時 · 男"
}

export function Result({ nav, loggedIn, areas, subjectName, birthLabel }: ResultProps) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const [showAll, setShowAll] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [plateSel, setPlateSel] = useState('命宮');
  const [plateMode, setPlateMode] = useState<'쉬운 보기' | '전통 보기'>('쉬운 보기');

  const sixKeys = ['命宮', '夫妻宮', '財帛宮', '官祿宮', '疾厄宮', '田宅宮'];
  const list = showAll
    ? allAreas
    : allAreas.filter((a) => sixKeys.includes(a.cn)).sort((a, b) => sixKeys.indexOf(a.cn) - sixKeys.indexOf(b.cn));
  const soul = allAreas.find((a) => a.cn === '命宮') ?? allAreas[0];
  const plateCur = allAreas.find((a) => a.cn === plateSel) ?? soul;

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      {/* 스크롤 안내 화살표 애니메이션 — 한 번만 정의 */}
      <style>{`
        @keyframes zmds-scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${Z.p850}, ${Z.p700})`,
          padding: 'calc(env(safe-area-inset-top) + 28px) 20px 22px',
          borderBottomLeftRadius: 26,
          borderBottomRightRadius: 26,
        }}
      >
        <StarField count={30} gold={4} seed={9} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{birthLabel ?? '1990.05.20 · 양력 · 子時 · 男'}</div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 3 }}>
              {subjectName ?? '내 명반'} <span style={{ color: Z.goldBright }}>命盤</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => nav.requireLogin('save', () => showToast('명반을 저장했어요'))}
              style={{
                fontFamily: SANS,
                fontSize: 12.5,
                color: '#fff',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'transparent',
                borderRadius: 18,
                padding: '7px 13px',
                cursor: 'pointer',
              }}
            >
              저장
            </button>
            <button
              onClick={() => nav.requireLogin('share', () => setShare(true))}
              style={{
                fontFamily: SANS,
                fontSize: 12.5,
                color: Z.ink,
                fontWeight: 700,
                border: 'none',
                background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
                borderRadius: 18,
                padding: '7px 13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 4px 12px rgba(199,162,63,0.35)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8a3 3 0 10-2.8-4M6 15a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 10-2.8-4M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"
                  stroke={Z.ink}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              공유
            </button>
          </div>
        </div>
        <Link
          href={nav.hrefFor('detail', { key: '命宮' })}
          aria-label={`내 명궁 ${soul.cn} 상세 보기`}
          style={{
            position: 'relative',
            marginTop: 16,
            display: 'flex',
            gap: 13,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(227,195,107,0.25)',
            borderRadius: 16,
            padding: 13,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <AreaIcon h={soul.h} size={50} sel />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 12, color: Z.goldBright, fontWeight: 600 }}>나의 명궁 · {soul.cn}</div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#fff', margin: '1px 0 3px' }}>
              {soul.stars.join(' · ')} <Brightness b={soul.br} />
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              {soul.line}
            </div>
          </div>
          <svg width="8" height="14" viewBox="0 0 8 14" aria-hidden>
            <path d="M1 1l6 6-6 6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {!loggedIn && (
        <div
          style={{
            margin: '14px 18px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            background: Z.p50,
            border: `1px solid ${Z.p100}`,
            borderRadius: 12,
            padding: '10px 12px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 10V7a5 5 0 019.6-2" stroke={Z.p600} strokeWidth="2" strokeLinecap="round" />
            <rect x="4" y="10" width="16" height="10" rx="2.5" stroke={Z.p600} strokeWidth="2" />
          </svg>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, lineHeight: 1.4 }}>
            로그인 없이 보는 중 · <b style={{ color: Z.ink }}>명반·12영역은 모두 무료</b>, 저장·공유·심층풀이는 가입 후
          </span>
        </div>
      )}

      {/* ── 명반 차트 카드 (메인) ──────────────────────────────────── */}
      <div style={{ padding: '18px 18px 0' }}>
        <div
          id="plate"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(175deg, ${Z.p900}, ${Z.p850})`,
            borderRadius: 22,
            padding: '18px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 10px 28px rgba(36,26,61,0.18)',
          }}
        >
          <StarField count={22} gold={3} seed={3} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: '#fff' }}>
              명반 차트 <span style={{ color: Z.goldBright }}>命盤</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{birthLabel ?? ''}</div>
          </div>
          <div style={{ position: 'relative' }}>
            <Seg
              options={['쉬운 보기', '전통 보기']}
              value={plateMode}
              onChange={(v) => setPlateMode(v as '쉬운 보기' | '전통 보기')}
              dark
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Plate selKey={plateSel} onSel={setPlateSel} easy={plateMode === '쉬운 보기'} areas={allAreas} />
          </div>
          <div
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(227,195,107,0.25)',
              borderRadius: 14,
              padding: 12,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <AreaIcon h={plateCur.h} size={42} sel />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: '#fff' }}>{plateCur.ko}</span>
                <span style={{ fontFamily: SERIF, fontSize: 12.5, color: Z.p300 }}>{plateCur.cn}</span>
                <Brightness b={plateCur.br} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 12.5, color: Z.goldBright, margin: '3px 0' }}>{plateCur.stars.join(' · ')}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{plateCur.line}</div>
            </div>
          </div>
          <button
            onClick={() => nav.go('detail', { key: plateSel })}
            style={{
              position: 'relative',
              width: '100%',
              cursor: 'pointer',
              border: 'none',
              borderRadius: 14,
              padding: '13px',
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 700,
              color: Z.ink,
              background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
              boxShadow: '0 6px 18px rgba(199,162,63,0.32)',
            }}
          >
            이 자리 자세히 보기 →
          </button>
          <div style={{ position: 'relative', textAlign: 'center', fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
            각 궁을 눌러 선택 · 두 번 눌러 상세
          </div>
        </div>
      </div>

      {/* ── 스크롤 안내 ─────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '18px 18px 6px',
          animation: 'zmds-scroll-hint 1.6s ease-in-out infinite',
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink3, fontWeight: 600 }}>
          아래로 스크롤하여 12 영역 보기
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke={Z.p600} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── 12 영역 리스트 ─────────────────────────────────────── */}
      <div style={{ padding: '8px 18px 26px', flex: 1 }}>
        <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, margin: '6px 4px 12px' }}>
          12궁을 <b style={{ color: Z.ink }}>내 인생 영역</b>으로 풀었어요 · 눌러서 자세히 보기
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((a) => (
            <Link
              key={a.cn}
              href={nav.hrefFor('detail', { key: a.cn })}
              aria-label={`${a.ko} (${a.cn}) 상세 보기`}
              style={{
                display: 'flex',
                gap: 13,
                alignItems: 'center',
                background: Z.white,
                border: `1px solid ${a.sel ? Z.p100 : Z.line}`,
                borderRadius: 18,
                padding: '12px 14px',
                boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <AreaIcon h={a.h} size={44} sel={a.sel} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: Z.ink }}>{a.ko}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: Z.ink3 }}>{a.cn}</span>
                  <Brightness b={a.br} />
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: Z.ink2,
                    marginTop: 3,
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {a.line}
                </div>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }} aria-hidden>
                <path d="M1 1l6 6-6 6" stroke={Z.ink3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
        <button
          onClick={() => setShowAll((s) => !s)}
          style={{
            width: '100%',
            marginTop: 12,
            cursor: 'pointer',
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 600,
            color: Z.p600,
            background: 'transparent',
            border: `1.5px dashed ${Z.p100}`,
            borderRadius: 14,
            padding: '12px',
          }}
        >
          {showAll ? '접기 ▴' : '나머지 6개 영역 더보기 ▾'}
        </button>
      </div>

      <TabBar active="result" nav={nav} />
      <ShareSheet open={share} onClose={() => setShare(false)} showToast={showToast} />
      <Toast msg={toast} />
    </div>
  );
}
