'use client';

// components/sheets/Toast.tsx — auto-dismissing toast (driven by useToast)
import { Z, SANS } from '@/theme/tokens';

export function Toast({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 46,
        zIndex: 200,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: msg ? 1 : 0,
        transform: `translateY(${msg ? 0 : 8}px)`,
        transition: 'opacity .2s, transform .2s',
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 13.5,
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(30,22,48,0.92)',
          borderRadius: 22,
          padding: '10px 18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          maxWidth: '80%',
          textAlign: 'center',
        }}
      >
        {msg || ' '}
      </div>
    </div>
  );
}