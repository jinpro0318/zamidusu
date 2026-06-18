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
  relation?: string;
  createdAt: string;
}

export function SavedChartsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<SavedChart[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const openChart = (id: string) => {
    onClose();
    router.push(`/chart/${id}`);
  };

  const startEdit = (c: SavedChart) => {
    setError(null);
    setEditingId(c.id);
    setEditName(c.subjectName ?? '');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };
  const saveEdit = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/charts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName: editName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCharts((cur) => (cur ? cur.map((c) => (c.id === id ? { ...c, subjectName: data.subjectName } : c)) : cur));
      cancelEdit();
    } catch {
      setError('이름 수정에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusyId(null);
    }
  };
  const del = async (id: string) => {
    if (!window.confirm('이 명반을 삭제할까요? 삭제하면 되돌릴 수 없어요.')) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/charts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCharts((cur) => (cur ? cur.filter((c) => c.id !== id) : cur));
    } catch {
      setError('삭제에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setBusyId(null);
    }
  };

  if (!open) return null;

  // 작은 액션 버튼 공통 스타일
  const actionBtn = {
    flexShrink: 0,
    cursor: 'pointer',
    border: `1px solid ${Z.line}`,
    background: Z.white,
    borderRadius: 9,
    padding: '6px 10px',
    fontFamily: SANS,
    fontSize: 12,
    fontWeight: 700,
  } as const;

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
            선택하면 바로 열리고, 이름 수정·삭제도 할 수 있어요
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
            const editing = editingId === c.id;
            const busy = busyId === c.id;
            return (
              <div
                key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 8px 22px' }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 12,
                    background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                    color: Z.goldBright, fontWeight: 700, fontSize: 19,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  命
                </span>

                {editing ? (
                  // ── 이름 수정 모드 ──
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="명반 이름"
                      autoFocus
                      maxLength={40}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(c.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      style={{
                        flex: 1, minWidth: 0, boxSizing: 'border-box',
                        background: Z.white, border: `1.5px solid ${Z.p500}`, borderRadius: 10,
                        padding: '9px 11px', fontFamily: SANS, fontSize: 15, color: Z.ink, outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(c.id)}
                      disabled={busy}
                      style={{ ...actionBtn, border: 'none', color: '#fff', background: `linear-gradient(180deg,${Z.p600},${Z.p700})` }}
                    >
                      {busy ? '…' : '저장'}
                    </button>
                    <button type="button" onClick={cancelEdit} style={{ ...actionBtn, color: Z.ink3 }}>
                      취소
                    </button>
                  </>
                ) : (
                  // ── 기본: 열기 + 수정 + 삭제 ──
                  <>
                    <button
                      type="button"
                      onClick={() => openChart(c.id)}
                      aria-label={`저장된 명반 열기: ${label}, ${sub}`}
                      style={{
                        flex: 1, minWidth: 0, textAlign: 'left', border: 'none',
                        background: 'transparent', cursor: 'pointer', padding: 0,
                      }}
                    >
                      <span
                        style={{
                          display: 'block', fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: Z.ink,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 2 }}>
                        <span>{sub}</span>
                        {c.relation && c.relation !== '본인' && (
                          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: Z.p600, background: 'rgba(124,58,237,0.10)', borderRadius: 6, padding: '1px 6px' }}>
                            {c.relation}
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      aria-label={`${label} 이름 수정`}
                      style={{ ...actionBtn, color: Z.p600 }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => del(c.id)}
                      disabled={busy}
                      aria-label={`${label} 삭제`}
                      style={{ ...actionBtn, color: '#C0463F', borderColor: 'rgba(192,70,63,0.35)' }}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
