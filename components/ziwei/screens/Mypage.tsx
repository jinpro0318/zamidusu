'use client';

// screens/Mypage.tsx — profile + saved charts
import { Z, SERIF, SANS } from '@/theme/tokens';
import { TabBar } from '@/components/ziwei/common';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import type { Nav } from '@/lib/ziwei-types';

export interface SavedItem {
  id?: string;
  label: string;
  sub: string;
  cn: string;
}

export function Mypage({
  nav, saved: savedProp, email,
}: {
  nav: Nav;
  saved?: SavedItem[];
  email?: string;
}) {
  const [toast, showToast] = useToast();
  const saved: SavedItem[] = savedProp && savedProp.length
    ? savedProp
    : [
        { label: '내 명반', sub: '1990.05.20 · 子時 · 男', cn: '命' },
      ];
  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(env(safe-area-inset-top) + 20px) 20px 10px' }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: Z.ink }}>마이페이지</div>
        <button onClick={() => showToast('설정 (준비 중)')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke={Z.ink2} strokeWidth="2" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke={Z.ink2} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div style={{ padding: '8px 18px 26px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* profile */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: '16px' }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              flexShrink: 0,
              background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: Z.goldBright,
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            도
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: Z.ink }}>도윤</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, marginTop: 2 }}>doyoon@example.com</div>
          </div>
          <button
            onClick={() => showToast('프로필 수정 (준비 중)')}
            style={{ border: `1.5px solid ${Z.p100}`, background: Z.p50, cursor: 'pointer', borderRadius: 12, padding: '8px 12px', fontFamily: SANS, fontSize: 13, fontWeight: 600, color: Z.p600 }}
          >
            수정
          </button>
        </div>

        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink, margin: '2px 4px 10px' }}>
            내 명반 <span style={{ color: Z.ink3, fontWeight: 500 }}>({saved.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {saved.map((s, i) => (
              <div
                key={i}
                onClick={() => (s.id ? nav.go('result', { chartId: s.id }) : nav.tab('result'))}
                style={{
                  display: 'flex',
                  gap: 13,
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: Z.white,
                  border: `1px solid ${Z.line}`,
                  borderRadius: 16,
                  padding: '12px 14px',
                  boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p900})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: Z.goldBright,
                    fontFamily: SERIF,
                    fontSize: 22,
                    fontWeight: 700,
                    boxShadow: '0 0 0 1px rgba(227,195,107,0.4)',
                  }}
                >
                  {s.cn}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink }}>{s.label}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 2 }}>{s.sub}</div>
                </div>
                <svg width="8" height="14" viewBox="0 0 8 14">
                  <path d="M1 1l6 6-6 6" stroke={Z.ink3} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => nav.go('input')}
          style={{
            width: '100%',
            cursor: 'pointer',
            border: 'none',
            borderRadius: 16,
            padding: '15px',
            fontFamily: SANS,
            fontSize: 16,
            fontWeight: 700,
            color: '#fff',
            background: `linear-gradient(180deg,${Z.p600},${Z.p700})`,
            boxShadow: '0 8px 22px rgba(76,58,124,0.34)',
          }}
        >
          + 새 명반 만들기
        </button>
      </div>

      <TabBar active="mypage" nav={nav} />
      <Toast msg={toast} />
    </div>
  );
}