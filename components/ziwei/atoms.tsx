'use client';

// components/ui/atoms.tsx — shared brand atoms
import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { Z, SERIF, SANS, BR, BRIGHTNESS_INFO } from '@/theme/tokens';
import type { BrightnessKey } from '@/theme/tokens';

// ── brightness badge (廟旺利陷) — 호버(데스크탑)/탭(모바일) 시 의미 툴팁 ──
// 격자 셀·리스트 카드가 <button>이라 중첩 버튼을 피하려고 <span> 기반으로 구현.
export function Brightness({ b, sm }: { b: string; sm?: boolean }) {
  const c = BR[b as BrightnessKey] || BR['平'];
  const info = BRIGHTNESS_INFO[b] || BRIGHTNESS_INFO['平'];
  const label = `별의 기운 세기 ${b} — ${info.ko}, ${info.desc}`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  // 모바일 탭 시: 바깥 탭/ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDoc, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDoc, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        title={label}
        onClick={(e) => {
          // 부모 셀(버튼) 선택 동작과 충돌하지 않도록 전파 차단
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }
        }}
        style={{
          fontFamily: SERIF,
          fontSize: sm ? 10 : 11,
          fontWeight: 700,
          color: c.fg,
          background: c.bg,
          border: `1px solid ${c.bd}`,
          borderRadius: 6,
          padding: sm ? '1px 5px' : '2px 6px',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          cursor: 'help',
          userSelect: 'none',
        }}
      >
        {b}
      </span>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 7px)',
            right: 0,
            zIndex: 200,
            width: 'max-content',
            maxWidth: 200,
            fontFamily: SANS,
            fontSize: 11.5,
            fontWeight: 500,
            lineHeight: 1.45,
            color: '#fff',
            background: Z.p900,
            border: `1px solid ${Z.p700}`,
            borderRadius: 9,
            padding: '8px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            textAlign: 'left',
            whiteSpace: 'normal',
            pointerEvents: 'none',
          }}
        >
          <b style={{ color: Z.goldBright, fontWeight: 800 }}>{b} · {info.ko}</b>
          <br />
          {info.desc}
        </span>
      )}
    </span>
  );
}

// ── circular hanja "icon" — premium, on-brand (replaces emoji) ──
export function AreaIcon({ h, size = 46, sel = false }: { h: string; size?: number; sel?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: sel
          ? `radial-gradient(circle at 35% 30%, ${Z.p600}, ${Z.p800})`
          : `radial-gradient(circle at 35% 30%, ${Z.p700}, ${Z.p900})`,
        boxShadow: sel
          ? `0 0 0 2px ${Z.goldBright}, 0 6px 14px rgba(76,58,124,0.35)`
          : '0 4px 10px rgba(36,26,61,0.22)',
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontSize: size * 0.46,
          fontWeight: 700,
          color: Z.goldBright,
          lineHeight: 1,
          marginTop: -1,
        }}
      >
        {h}
      </span>
    </div>
  );
}

// ── decorative starfield background (deterministic) ──
export function StarField({ count = 46, gold = 6, seed = 3 }: { count?: number; gold?: number; seed?: number }) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const dots: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const g = i < gold;
    const sz = g ? 2.2 + rnd() * 1.6 : 0.8 + rnd() * 1.7;
    dots.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${rnd() * 100}%`,
          top: `${rnd() * 100}%`,
          width: sz,
          height: sz,
          borderRadius: '50%',
          background: g ? Z.goldBright : 'rgba(255,255,255,0.85)',
          opacity: g ? 0.95 : 0.25 + rnd() * 0.6,
          boxShadow: g ? `0 0 ${6 + rnd() * 6}px ${Z.goldBright}` : 'none',
        }}
      />,
    );
  }
  return <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>{dots}</div>;
}

// ── buttons ──
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { gold?: boolean };

export function PrimaryBtn({ children, gold = false, style, ...p }: BtnProps) {
  return (
    <button
      {...p}
      style={{
        width: '100%',
        border: 'none',
        borderRadius: 16,
        cursor: 'pointer',
        padding: '16px 18px',
        fontFamily: SANS,
        fontSize: 17,
        fontWeight: 700,
        color: gold ? Z.ink : '#fff',
        background: gold
          ? `linear-gradient(180deg, ${Z.goldBright}, ${Z.gold})`
          : `linear-gradient(180deg, ${Z.p600}, ${Z.p700})`,
        boxShadow: gold ? '0 8px 22px rgba(199,162,63,0.36)' : '0 8px 22px rgba(76,58,124,0.38)',
        letterSpacing: -0.2,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, dark = false, style, ...p }: BtnProps & { dark?: boolean }) {
  return (
    <button
      {...p}
      style={{
        width: '100%',
        borderRadius: 16,
        cursor: 'pointer',
        padding: '14px 18px',
        fontFamily: SANS,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: -0.2,
        color: dark ? Z.p300 : Z.p600,
        background: dark ? 'rgba(255,255,255,0.06)' : Z.p50,
        border: `1.5px solid ${dark ? 'rgba(183,164,224,0.3)' : Z.p100}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function KakaoBtn({ children = '카카오로 시작하기', ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      style={{
        width: '100%',
        border: 'none',
        borderRadius: 16,
        cursor: 'pointer',
        padding: '15px 18px',
        fontFamily: SANS,
        fontSize: 16,
        fontWeight: 700,
        background: Z.kakao,
        color: '#3C1E1E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: -0.2,
      }}
    >
      <svg width="20" height="19" viewBox="0 0 20 19" fill="none">
        <path
          d="M10 1C4.9 1 .8 4.2.8 8.1c0 2.5 1.7 4.7 4.2 6L4 17.9c-.1.3.2.5.5.4l4.3-2.8c.4 0 .8.1 1.2.1 5.1 0 9.2-3.2 9.2-7.5S15.1 1 10 1z"
          fill="#3C1E1E"
        />
      </svg>
      {children}
    </button>
  );
}

export function GoogleBtn({ children = 'Google로 계속하기', ...p }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      style={{
        width: '100%',
        border: '1.5px solid #DADCE0',
        borderRadius: 16,
        cursor: 'pointer',
        padding: '14px 18px',
        fontFamily: SANS,
        fontSize: 16,
        fontWeight: 700,
        background: '#fff',
        color: '#3C4043',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        letterSpacing: -0.2,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.96a9 9 0 0 0 0 8.06l2.99-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
      </svg>
      {children}
    </button>
  );
}

// ── segmented control ──
export function Seg({
  options,
  value,
  onChange,
  dark = false,
}: {
  options: string[];
  value: string;
  onChange?: (v: string) => void;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        background: dark ? 'rgba(255,255,255,0.08)' : Z.p50,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : Z.line}`,
        borderRadius: 13,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            onClick={() => onChange?.(o)}
            style={{
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              borderRadius: 9,
              padding: '9px 6px',
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: on ? 700 : 500,
              color: on ? '#fff' : dark ? Z.p300 : Z.ink2,
              background: on ? `linear-gradient(180deg,${Z.p600},${Z.p700})` : 'transparent',
              boxShadow: on ? '0 3px 8px rgba(76,58,124,0.3)' : 'none',
              whiteSpace: 'nowrap',
              letterSpacing: -0.3,
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// re-export style constants for convenience
export type { CSSProperties };