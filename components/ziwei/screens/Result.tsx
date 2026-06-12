'use client';

// screens/Result.tsx — 메인 결과 화면 (명반 차트 + 12영역 통합 스크롤 페이지)
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { Plate } from '@/components/ziwei/Plate';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { LoginGate } from '@/components/ziwei/sheets/LoginGate';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { starWithHanja } from '@/lib/star-names';
import type { Area, GateState, Nav } from '@/lib/ziwei-types';

interface ResultProps {
  nav: Nav;
  areas?: Area[];
  subjectName?: string;
  birthLabel?: string;
  loggedIn?: boolean;
}

export function Result({ nav, areas, subjectName, birthLabel, loggedIn = true }: ResultProps) {
  const router = useRouter();
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const [showAll, setShowAll] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [plateSel, setPlateSel] = useState('命宮');
  const [gate, setGate] = useState<GateState | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const guardDetail = (e: React.MouseEvent, href: string) => {
    if (loggedIn) return;
    e.preventDefault();
    setPendingHref(href);
    setGate({ reason: 'detail', onSuccess: null });
  };

  const sixKeys = ['命宮', '夫妻宮', '財帛宮', '官祿宮', '疾厄宮', '田宅宮'];
  const list = showAll
    ? allAreas
    : allAreas.filter((a) => sixKeys.includes(a.cn)).sort((a, b) => sixKeys.indexOf(a.cn) - sixKeys.indexOf(b.cn));
  const soul = allAreas.find((a) => a.cn === '命宮') ?? allAreas[0];
  const plateCur = allAreas.find((a) => a.cn === plateSel) ?? soul;

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes zmds-scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

      {/* ── 통합 다크 패널: 헤더 + 명반 차트 ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(175deg, ${Z.p900} 0%, ${Z.p850} 55%, ${Z.p800} 100%)`,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <StarField count={40} gold={5} seed={9} />

        {/* 상단 액션 바: 저장·공유만 우측 정렬 */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 'calc(env(safe-area-inset-top) + 14px) 18px 0' }}>
          <button
            onClick={() => nav.requireLogin('save', () => showToast('명반을 저장했어요'))}
            style={{
              fontFamily: SANS, fontSize: 12.5, color: '#fff', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
              borderRadius: 18, padding: '7px 13px', cursor: 'pointer',
            }}
          >
            저장
          </button>
          <button
            onClick={() => nav.requireLogin('share', () => setShare(true))}
            style={{
              fontFamily: SANS, fontSize: 12.5, color: Z.ink, fontWeight: 700,
              border: 'none', background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
              borderRadius: 18, padding: '7px 13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 4px 12px rgba(199,162,63,0.35)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a3 3 0 10-2.8-4M6 15a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 10-2.8-4M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke={Z.ink} strokeWidth="2" strokeLinecap="round" />
            </svg>
            공유
          </button>
        </div>

        {/* 명반 차트 영역 */}
        <div style={{ position: 'relative', padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ textAlign: 'center', fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#fff' }}>
            내 명반 차트
          </div>
          <Plate selKey={plateSel} onSel={setPlateSel} easy={true} areas={allAreas} />
          {/* 선택 궁 요약 카드 — 탭하면 상세 풀이로 이동 */}
          <Link
            href={nav.hrefFor('detail', { key: plateSel })}
            onClick={(e) => guardDetail(e, nav.hrefFor('detail', { key: plateSel }))}
            aria-label={`${plateCur.ko} (${plateCur.cn}) 상세 풀이 보기`}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(227,195,107,0.22)',
              borderRadius: 14, padding: '11px 14px', display: 'flex', gap: 12, alignItems: 'center',
              color: 'inherit', textDecoration: 'none',
            }}
          >
            <AreaIcon h={plateCur.h} size={42} sel />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff' }}>{plateCur.ko}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13, color: Z.p300 }}>{plateCur.cn}</span>
                <Brightness b={plateCur.br} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: Z.goldBright, margin: '2px 0' }}>
                {plateCur.stars.length > 0
                  ? plateCur.stars.map((s) => `★${starWithHanja(s)}`).join(' · ')
                  : '공궁(空宮)'}
              </div>
              {plateCur.subStars && plateCur.subStars.length > 0 && (
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: Z.p300, margin: '0 0 2px' }}>
                  {plateCur.subStars.join(' · ')}
                </div>
              )}
              <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>{plateCur.line}</div>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" style={{ flexShrink: 0 }} aria-hidden>
              <path d="M1 1l6 6-6 6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {/* 명반 일시 — 차트 하단 중앙 */}
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
            {subjectName ? `${subjectName} · ` : ''}{birthLabel ?? ''}
          </div>
          <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            각 궁을 눌러 선택 · 카드를 눌러 상세 풀이
          </div>

          {/* 스크롤 안내 — 다크 패널 하단에 배치해 확실히 보이도록 */}
          <div
            aria-hidden
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              animation: 'zmds-scroll-hint 1.6s ease-in-out infinite',
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>
              아래로 스크롤하면 12개 영역 풀이가 있어요
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke={Z.goldBright} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 12 영역 리스트 ── */}
      <div style={{ padding: '8px 18px 26px', flex: 1 }}>
        <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, margin: '6px 4px 12px' }}>
          12궁을 <b style={{ color: Z.ink }}>내 인생 영역</b>으로 풀었어요 · 눌러서 자세히 보기
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((a) => (
            <Link
              key={a.cn}
              href={nav.hrefFor('detail', { key: a.cn })}
              onClick={(e) => guardDetail(e, nav.hrefFor('detail', { key: a.cn }))}
              aria-label={`${a.ko} (${a.cn}) 상세 보기`}
              style={{
                display: 'flex', gap: 13, alignItems: 'center',
                background: Z.white, border: `1px solid ${a.sel ? Z.p100 : Z.line}`,
                borderRadius: 18, padding: '12px 14px',
                boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                color: 'inherit', textDecoration: 'none',
              }}
            >
              <AreaIcon h={a.h} size={44} sel={a.sel} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: Z.ink }}>{a.ko}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: Z.ink3 }}>{a.cn}</span>
                  <Brightness b={a.br} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            width: '100%', marginTop: 12, cursor: 'pointer',
            fontFamily: SANS, fontSize: 14, fontWeight: 600, color: Z.p600,
            background: 'transparent', border: `1.5px dashed ${Z.p100}`,
            borderRadius: 14, padding: '12px',
          }}
        >
          {showAll ? '접기 ▴' : '나머지 6개 영역 더보기 ▾'}
        </button>
      </div>

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        showToast={showToast}
        soulStars={allAreas.find((x) => x.cn === '命宮')?.stars}
      />
      <LoginGate
        gate={gate}
        onClose={() => setGate(null)}
        onLogin={() => router.push(`/sign-in?callbackUrl=${encodeURIComponent(pendingHref ?? '/')}`)}
      />
      <Toast msg={toast} />
    </div>
  );
}
