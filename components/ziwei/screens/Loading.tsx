'use client';

// screens/Loading.tsx — 명반 generating animation
import { useEffect, useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { StarField } from '@/components/ziwei/atoms';
import type { Nav } from '@/lib/ziwei-types';

export function Loading({ nav }: { nav: Nav }) {
  const steps = [
    '음양력을 만세력으로 변환하는 중…',
    '12궁(十二宮)을 배치하는 중…',
    '14주성·보좌성을 계산하는 중…',
    '쉬운 해석을 준비하는 중…',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setI((p) => Math.min(p + 1, steps.length - 1)), 520);
    const t2 = setTimeout(() => nav.reset('result'), 2300);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      style={{
        minHeight: '100%',
        position: 'relative',
        background: `linear-gradient(170deg, ${Z.p900}, ${Z.p800})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <StarField count={50} gold={6} seed={21} />
      <div
        style={{
          position: 'relative',
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: `radial-gradient(circle at 38% 32%, ${Z.p500}, ${Z.p900})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 50px rgba(199,162,63,0.3)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: Z.goldBright,
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontFamily: SERIF, fontSize: 58, fontWeight: 700, color: Z.goldBright }}>命</span>
      </div>
      <div style={{ position: 'relative', marginTop: 34, fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#fff' }}>명반을 그리는 중</div>
      <div
        style={{
          position: 'relative',
          marginTop: 10,
          fontFamily: SANS,
          fontSize: 14.5,
          color: Z.p300,
          textAlign: 'center',
          minHeight: 22,
          transition: 'opacity .3s',
        }}
      >
        {steps[i]}
      </div>
      <div style={{ position: 'relative', marginTop: 22, width: 180, height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${((i + 1) / steps.length) * 100}%`,
            background: `linear-gradient(90deg,${Z.p500},${Z.goldBright})`,
            borderRadius: 4,
            transition: 'width .4s',
          }}
        />
      </div>
    </div>
  );
}