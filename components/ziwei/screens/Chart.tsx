'use client';

// screens/Chart.tsx — 명반 plate chart
import { useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField, Seg } from '@/components/ziwei/atoms';
import { Plate } from '@/components/ziwei/Plate';
import { TabBar } from '@/components/ziwei/common';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import type { Area, Nav } from '@/lib/ziwei-types';

interface ChartProps {
  nav: Nav;
  areas?: Area[];
  birthLabel?: string;
}

export function Chart({ nav, areas, birthLabel }: ChartProps) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const [sel, setSel] = useState('命宮');
  const [mode, setMode] = useState('쉬운 보기');
  const cur = allAreas.find((a) => a.cn === sel) ?? allAreas.find((a) => a.cn === '命宮') ?? allAreas[0];
  return (
    <div
      style={{
        minHeight: '100%',
        background: `linear-gradient(175deg, ${Z.p900}, ${Z.p850})`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StarField count={36} gold={5} seed={5} />
      <div style={{ position: 'relative', padding: 'calc(env(safe-area-inset-top) + 24px) 18px 24px', display: 'flex', flexDirection: 'column', gap: 15, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
            명반 차트 <span style={{ color: Z.goldBright }}>命盤</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{birthLabel ?? ''}</div>
        </div>
        <Seg
          options={['12 영역', '쉬운 보기', '전통 보기']}
          value={mode === '쉬운 보기' || mode === '전통 보기' ? mode : '쉬운 보기'}
          onChange={(v) => {
            if (v === '12 영역') nav.tab('result');
            else setMode(v);
          }}
          dark
        />
        <Plate selKey={sel} onSel={setSel} easy={mode === '쉬운 보기'} areas={allAreas} />
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(227,195,107,0.25)',
            borderRadius: 16,
            padding: 14,
            display: 'flex',
            gap: 13,
            alignItems: 'center',
          }}
        >
          <AreaIcon h={cur.h} size={46} sel />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff' }}>{cur.ko}</span>
              <span style={{ fontFamily: SERIF, fontSize: 13, color: Z.p300 }}>{cur.cn}</span>
              <Brightness b={cur.br} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 13, color: Z.goldBright, margin: '3px 0' }}>{cur.stars.join(' · ')}</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.45 }}>{cur.line}</div>
          </div>
        </div>
        <button
          onClick={() => nav.go('detail', { key: sel })}
          style={{
            width: '100%',
            cursor: 'pointer',
            border: 'none',
            borderRadius: 15,
            padding: '14px',
            fontFamily: SANS,
            fontSize: 15.5,
            fontWeight: 700,
            color: Z.ink,
            background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
            boxShadow: '0 8px 22px rgba(199,162,63,0.32)',
          }}
        >
          이 자리 자세히 보기 →
        </button>
        <div style={{ textAlign: 'center', fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
          각 궁을 눌러 성계 배치와 해석을 확인하세요
        </div>
      </div>
      <TabBar active="chart" nav={nav} />
    </div>
  );
}