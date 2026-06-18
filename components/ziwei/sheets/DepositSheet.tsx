'use client';

// components/ziwei/sheets/DepositSheet.tsx — 깊은풀이 무통장입금 신청 바텀시트.
// 계좌정보(서버 env에서 받은 값)를 표시하고 입금자명을 받아 Purchase(PENDING)를 생성한다.
// 입금확인(PAID)은 관리자가 수동으로 처리하므로 여기선 "입금 확인 후 열려요"까지 안내한다.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SERIF, SANS } from '@/theme/tokens';

export interface BankInfo {
  name: string;
  account: string;
  holder: string;
}

export function DepositSheet({
  open,
  onClose,
  bank,
}: {
  open: boolean;
  onClose: () => void;
  /** 정식 결제 전환 시 사용(현재 테스트 단계라 미사용). */
  chartId?: string;
  bank: BankInfo;
}) {
  const router = useRouter();
  const [depositorName, setDepositorName] = useState('');
  const [sending] = useState(false);
  const [done] = useState(false); // 정식 전환 시 "입금 확인 후 열려요" 완료 화면 복구용
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 계좌번호를 숫자만(하이픈 제거) 클립보드에 복사 — 송금 입력창에 바로 붙여넣기 좋게.
  const copyAccount = async () => {
    const digits = bank.account.replace(/[^0-9]/g, '');
    try {
      await navigator.clipboard.writeText(digits);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr('복사에 실패했어요. 길게 눌러 복사해 주세요.');
    }
  };

  if (!open) return null;

  const close = () => {
    onClose();
    // 닫힌 뒤 상태 초기화(애니메이션 여유)
    setTimeout(() => {
      setDepositorName('');
      setErr(null);
    }, 200);
  };

  const submit = () => {
    if (depositorName.trim().length < 1) {
      setErr('입금자명을 입력해 주세요.');
      return;
    }
    // 테스트 단계: 실제 결제 처리/잠금해제 없이 안내 페이지로 이동.
    setErr(null);
    router.push('/pending');
  };

  const hasBank = !!(bank.name && bank.account);

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 170,
        background: 'rgba(20,14,35,0.55)',
        display: 'flex', alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="깊은 풀이 결제"
        style={{
          width: '100%', background: Z.cream,
          borderTopLeftRadius: 26, borderTopRightRadius: 26,
          padding: '12px 22px max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -12px 44px rgba(0,0,0,0.22)',
          animation: 'sheetUp .26s cubic-bezier(.3,.8,.4,1)',
          maxHeight: '86vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: Z.line, margin: '0 auto 16px' }} />

        {done ? (
          // ── 신청 완료 ──
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0 6px' }}>
            <div style={{ fontSize: 42 }} aria-hidden>🕊️</div>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 800, color: Z.ink }}>입금 확인 후 열려요</div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, textAlign: 'center', lineHeight: 1.6 }}>
              입금이 확인되면 이 명반의 깊은 풀이가 열립니다.
              <br />
              보통 영업시간 기준 빠르게 확인해 드려요.
            </div>
            <button
              onClick={close}
              style={{
                marginTop: 6, width: '100%', cursor: 'pointer', border: 'none', borderRadius: 14, padding: '13px',
                fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff',
                background: `linear-gradient(180deg,${Z.p600},${Z.p700})`,
              }}
            >
              확인
            </button>
          </div>
        ) : (
          // ── 입금 안내 + 입금자명 ──
          <>
            <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.p600, marginBottom: 4 }}>
              내게 맞는 깊은 풀이
            </div>
            <div style={{ textAlign: 'center', fontFamily: SERIF, fontSize: 22, fontWeight: 800, color: Z.ink }}>
              890원 · 무통장입금
            </div>
            <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 13, color: Z.ink2, margin: '8px 0 16px', lineHeight: 1.55 }}>
              아래 계좌로 입금 후 입금자명을 남겨주세요.
              <br />
              한 번 결제하면 이 명반의 깊은 풀이가 영구히 열려요.
            </div>

            {hasBank ? (
              <div style={{ background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontFamily: SANS, fontSize: 12, color: Z.ink3, marginBottom: 4 }}>입금 계좌 · {bank.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 17, fontWeight: 800, color: Z.ink, letterSpacing: '0.01em' }}>
                    {bank.account}
                  </span>
                  <button
                    type="button"
                    onClick={copyAccount}
                    aria-label="계좌번호 복사"
                    style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                      border: `1.5px solid ${Z.p100}`, background: Z.white, borderRadius: 10, padding: '6px 10px',
                      fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600,
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M3 8.5l3.5 3.5L13 4" stroke={Z.p600} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        복사됨
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="9" y="9" width="11" height="11" rx="2" stroke={Z.p600} strokeWidth="2" />
                          <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke={Z.p600} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        복사
                      </>
                    )}
                  </button>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, marginTop: 6 }}>예금주 {bank.holder}</div>
              </div>
            ) : (
              <div style={{ fontFamily: SANS, fontSize: 13, color: '#C0463F', marginBottom: 14 }}>
                계좌 정보가 설정되지 않았어요. 잠시 후 다시 시도해 주세요.
              </div>
            )}

            <label style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.ink, marginBottom: 6 }}>
              입금자명
            </label>
            <input
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              placeholder="입금하실 분의 성함"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: Z.white, border: `1.5px solid ${Z.line}`, borderRadius: 13,
                padding: '13px 14px', fontFamily: SANS, fontSize: 16, color: Z.ink, outline: 'none',
              }}
            />

            {err && <div style={{ fontFamily: SANS, fontSize: 12.5, color: '#C0463F', marginTop: 10 }}>{err}</div>}

            <button
              onClick={submit}
              disabled={sending || !hasBank}
              style={{
                marginTop: 14, width: '100%', cursor: sending || !hasBank ? 'default' : 'pointer',
                border: 'none', borderRadius: 14, padding: '14px',
                fontFamily: SANS, fontSize: 15.5, fontWeight: 800, color: '#fff',
                background: sending || !hasBank ? Z.ink3 : `linear-gradient(180deg,${Z.p600},${Z.p700})`,
                boxShadow: '0 6px 18px rgba(76,58,124,0.3)',
              }}
            >
              {sending ? '신청 중…' : '입금 완료했어요'}
            </button>
            <button
              onClick={close}
              style={{
                width: '100%', marginTop: 10, border: 'none', background: 'transparent',
                cursor: 'pointer', fontFamily: SANS, fontSize: 14, color: Z.ink3,
              }}
            >
              나중에 할게요
            </button>
          </>
        )}
      </div>
    </div>
  );
}
