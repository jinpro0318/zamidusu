'use client';

// components/ziwei/SavedChartsSheet.tsx
// 로그인한 사용자가 이전에 저장한 명반 목록을 바텀시트로 보여주고,
// 하나를 선택하면 해당 차트 페이지(/chart/[id])로 이동한다.
// 데이터 소스: 기존 GET /api/charts (회원 전용, 세션 기반) 재사용.
// 디자인: PickerSheet와 동일한 바텀시트 톤(보라/골드, 둥근 모서리, sheetUp 애니메이션).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SANS } from '@/theme/tokens';

interface SavedChart {
  id: string;
  subjectName: string | null;
  gender: 'MALE' | 'FEMALE';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  createdAt: string;
}

export function SavedChartsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<SavedChart[] | null>(null);

  // 시트가 열릴 때마다 최신 목록을 조회(회원 전용 GET /api/charts).
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetch('/api/charts', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('목록을 불러오지 못했어요.');
        const data = await res.json();
        if (alive) setCharts(Array.isArray(data?.charts) ? data.charts : []);
      })
      .catch(() => {
        if (alive) setError('저장한 명반을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        overflow: 'hidden',
        background: 'rgba(20,14,35,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="내 명반 불러오기"
        style={{
          width: '100%',
          maxHeight: '70%',
          background: Z.cream,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetUp .26s cubic-bezier(.3,.8,.4,1)',
        }}
      >
        <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${Z.line}` }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: Z.line, margin: '0 auto 12px' }} />
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: Z.ink }}>내 명반 불러오기</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 3 }}>
            저장한 명반을 선택하면 바로 열려요
          </div>
        </div>

        <div style={{ overflow: 'auto', padding: '8px 0 26px', minHeight: 120 }}>
          {loading && (
            <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: SANS, fontSize: 14, color: Z.ink2 }}>
              불러오는 중…
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: SANS, fontSize: 14, color: '#C0463F' }}>
              {error}
            </div>
          )}

          {!loading && !error && charts && charts.length === 0 && (
            <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: SANS, fontSize: 14, color: Z.ink2, lineHeight: 1.6 }}>
              아직 저장한 명반이 없어요.
              <br />
              아래에서 새 명반을 만들어 보세요.
            </div>
          )}

          {!loading && !error && charts && charts.map((c) => {
            const label = c.subjectName?.trim() || '내 명반';
            const sub = `${c.birthYear}.${String(c.birthMonth).padStart(2, '0')}.${String(c.birthDay).padStart(2, '0')} · ${c.gender === 'MALE' ? '男' : '女'}`;
            return (
              <button
                key={c.id}
                onClick={() => {
                  onClose();
                  router.push(`/chart/${c.id}`);
                }}
                aria-label={`저장된 명반 열기: ${label}, ${sub}`}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '13px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                    color: Z.goldBright,
                    fontWeight: 700,
                    fontSize: 19,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  命
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: SANS,
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: Z.ink,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ display: 'block', fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 2 }}>{sub}</span>
                </span>
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M1.5 1.5l6 6-6 6" stroke={Z.ink3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
