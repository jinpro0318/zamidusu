'use client';

// components/common/index.tsx — shared layout + form atoms
import type { ReactNode } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import type { Nav, ScreenKey } from '@/lib/ziwei-types';

// ── screen wrapper that re-triggers the slide-in animation on key change ──
export function AnimatedScreen({ keyId, children }: { keyId: string; children: ReactNode }) {
  return (
    <div key={keyId} className="animscr">
      {children}
    </div>
  );
}

// ── back bar ──
export function BackBar({ nav, title, dark, right }: { nav: Nav; title?: string; dark?: boolean; right?: ReactNode }) {
  const c = dark ? '#fff' : Z.ink;
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 'calc(env(safe-area-inset-top) + 16px) 14px 10px',
        background: 'transparent',
      }}
    >
      <button
        type="button"
        onClick={() => nav.back()}
        aria-label="이전 화면으로 돌아가기"
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path d="M10 2L2 10l8 8" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ flex: 1, fontFamily: SANS, fontSize: 17, fontWeight: 700, color: c }}>{title || ''}</div>
      {right}
    </div>
  );
}

// ── bottom tab bar ──
export function TabBar({ active, nav }: { active: ScreenKey; nav: Nav }) {
  const items: { k: ScreenKey; label: string; icon: (c: string) => ReactNode }[] = [
    {
      k: 'result',
      label: '홈',
      icon: (c) => <path d="M3 10.5L12 3l9 7.5M5 9v11h14V9" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      k: 'chart',
      label: '명반',
      icon: (c) => (
        <g>
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" stroke={c} strokeWidth="2" fill="none" />
          <path d="M3.5 9h17M9 3.5v17" stroke={c} strokeWidth="1.6" />
        </g>
      ),
    },
    {
      k: 'mypage',
      label: '마이',
      icon: (c) => (
        <g>
          <circle cx="12" cy="8.5" r="3.6" stroke={c} strokeWidth="2" fill="none" />
          <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ),
    },
  ];
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
        marginTop: 'auto',
        display: 'flex',
        background: 'rgba(255,255,255,0.86)',
        WebkitBackdropFilter: 'blur(14px)',
        backdropFilter: 'blur(14px)',
        borderTop: `1px solid ${Z.line}`,
        paddingBottom: 'max(22px, env(safe-area-inset-bottom))',
      }}
    >
      {items.map((it) => {
        const on = it.k === active;
        const c = on ? Z.p600 : Z.ink3;
        return (
          <button
            key={it.k}
            type="button"
            onClick={() => nav.tab(it.k)}
            aria-label={`${it.label} 탭으로 이동`}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '9px 0 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden>
              {it.icon(c)}
            </svg>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: on ? 700 : 500, color: c }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── bottom-sheet option picker ──
export function PickerSheet({
  open,
  title,
  options,
  value,
  onPick,
  onClose,
}: {
  open: boolean;
  title?: string;
  options: string[];
  value?: string;
  onPick: (o: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 160,
        borderRadius: 0, // 모바일 컨테이너에서 자체 코너로 처리
        overflow: 'hidden',
        background: 'rgba(20,14,35,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '62%',
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
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: Z.ink }}>{title}</div>
        </div>
        <div style={{ overflow: 'auto', padding: '6px 0 26px' }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <button
                key={o}
                onClick={() => {
                  onPick(o);
                  onClose();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: on ? Z.p50 : 'transparent',
                  cursor: 'pointer',
                  padding: '13px 22px',
                  fontFamily: SANS,
                  fontSize: 16,
                  fontWeight: on ? 700 : 500,
                  color: on ? Z.p600 : Z.ink,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {o}
                {on && (
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M3 8.5l3.5 3.5L13 4" stroke={Z.p600} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── tappable field (opens a picker) ──
export function TapField({ children, ph, onClick, flex }: { children?: ReactNode; ph?: string; onClick?: () => void; flex?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: flex ?? undefined,
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        background: Z.white,
        border: `1.5px solid ${Z.line}`,
        borderRadius: 13,
        padding: '13px 14px',
        fontFamily: SANS,
        fontSize: 16,
        color: children ? Z.ink : Z.ink3,
      }}
    >
      <span>{children || ph}</span>
      <svg width="11" height="7" viewBox="0 0 11 7">
        <path d="M1 1l4.5 4.5L10 1" stroke={Z.ink3} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── form label ──
export function Label({ children, req }: { children: ReactNode; req?: boolean }) {
  return (
    <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink, marginBottom: 8 }}>
      {children}
      {req && <span style={{ color: Z.p500 }}> *</span>}
    </div>
  );
}

// ── text input ──
export function TextInput({
  value,
  onChange,
  ph,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  ph?: string;
  type?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
      type={type}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: Z.white,
        border: `1.5px solid ${Z.line}`,
        borderRadius: 13,
        padding: '13px 14px',
        fontFamily: SANS,
        fontSize: 16,
        color: Z.ink,
        outline: 'none',
      }}
      onFocus={(e) => (e.target.style.borderColor = Z.p500)}
      onBlur={(e) => (e.target.style.borderColor = Z.line)}
    />
  );
}

// hairline serif constant used by some sheets
export { SERIF };