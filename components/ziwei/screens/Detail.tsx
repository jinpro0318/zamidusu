'use client';

// screens/Detail.tsx — single palace detail + suggested questions + chat
import { useRef, useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { QASheet } from '@/components/ziwei/sheets/QASheet';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { AREA_INFO } from '@/data/areaInfo';
import { QUESTIONS } from '@/data/questions';
import type { Area, Nav, NavParams, SuggestedQuestion } from '@/lib/ziwei-types';

interface Msg {
  me: boolean;
  t: string;
}

export function Detail({
  nav, params, loggedIn, areas,
}: {
  nav: Nav;
  params?: NavParams;
  loggedIn: boolean;
  areas?: Area[];
}) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const key = params?.key || '夫妻宮';
  const a = allAreas.find((x) => x.cn === key) || allAreas[0];
  const info = AREA_INFO[key] || { about: '', star: '', ai: '' };
  const qs = QUESTIONS[key] || [];
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [openQ, setOpenQ] = useState<SuggestedQuestion | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [txt, setTxt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const doSend = () => {
    const q = txt.trim() || `${a.ko}, 더 자세히 알려줘`;
    const reply = info.ai ? `${info.ai} 더 궁금한 점이 있으면 편하게 물어보세요.` : '곧 더 깊은 풀이를 준비할게요.';
    setMsgs((m) => [...m, { me: true, t: q }, { me: false, t: reply }]);
    setTxt('');
  };
  const onSend = () => (loggedIn ? doSend() : nav.requireLogin('ai', () => {}));

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      {/* header band */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${Z.p800}, ${Z.p600})`,
          padding: 'calc(env(safe-area-inset-top) + 16px) 14px 22px',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <StarField count={20} gold={3} seed={12} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => nav.back()}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path d="M10 2L2 10l8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => nav.requireLogin('save', () => showToast('명반을 저장했어요'))}
            style={{ border: 'none', background: 'rgba(255,255,255,0.14)', cursor: 'pointer', borderRadius: 16, padding: '7px 12px', fontFamily: SANS, fontSize: 12.5, color: '#fff', fontWeight: 600 }}
          >
            저장
          </button>
          <button
            onClick={() => nav.requireLogin('share', () => setShare(true))}
            style={{ border: 'none', background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`, cursor: 'pointer', borderRadius: 16, padding: '7px 12px', fontFamily: SANS, fontSize: 12.5, color: Z.ink, fontWeight: 700, marginLeft: 6 }}
          >
            공유
          </button>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center', marginTop: 10, padding: '0 4px' }}>
          <AreaIcon h={a.h} size={56} sel />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>{a.ko}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{a.cn}</span>
              {a.stars.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 12.5,
                    color: Z.goldBright,
                    background: 'rgba(227,195,107,0.15)',
                    border: '1px solid rgba(227,195,107,0.35)',
                    borderRadius: 8,
                    padding: '2px 8px',
                  }}
                >
                  {s}
                </span>
              ))}
              <Brightness b={a.br} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 18px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.p600, marginBottom: 5 }}>이 자리는?</div>
          <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.55 }}>{info.about}</div>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink, marginBottom: 9 }}>이 자리의 별 · {a.stars.join('·')}</div>
          <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 16px', fontFamily: SANS, fontSize: 14, color: Z.ink2, lineHeight: 1.6 }}>
            {info.star}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink, marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: `linear-gradient(180deg,${Z.p500},${Z.p700})`, display: 'inline-block' }} />
            AI 쉬운 풀이
          </div>
          <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 16px', fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.65 }}>
            {info.ai}
          </div>
        </div>

        {/* 추천 질문 */}
        <div>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink, marginBottom: 3 }}>이런 게 궁금하지 않나요?</div>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginBottom: 11 }}>{a.ko} 영역 맞춤 질문 · 탭하면 AI가 풀어드려요</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {qs.map((item, i) => (
              <button
                key={i}
                onClick={() => setOpenQ(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  background: Z.white,
                  border: `1.5px solid ${Z.p100}`,
                  borderRadius: 14,
                  padding: '13px 14px',
                  boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                }}
              >
                <span
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: Z.p50,
                    border: `1px solid ${Z.p100}`,
                    color: Z.p600,
                    fontFamily: SERIF,
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ?
                </span>
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: Z.ink }}>{item.q}</span>
                <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.p600, whiteSpace: 'nowrap' }}>AI 풀이 ›</span>
              </button>
            ))}
          </div>
          {!loggedIn && (
            <div style={{ fontFamily: SANS, fontSize: 12, color: Z.ink3, textAlign: 'center', marginTop: 10 }}>
              미리보기는 무료 · 전체 풀이는 가입 후 바로 열려요
            </div>
          )}
        </div>

        {/* chat */}
        {msgs.length > 0 && (
          <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.me ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: m.me ? `linear-gradient(180deg,${Z.p600},${Z.p700})` : Z.white,
                  color: m.me ? '#fff' : Z.ink,
                  border: m.me ? 'none' : `1px solid ${Z.line}`,
                  borderRadius: m.me ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
                  padding: '11px 14px',
                  fontFamily: SANS,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                }}
              >
                {m.t}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', background: Z.white, border: `1.5px solid ${Z.p100}`, borderRadius: 16, padding: '8px 8px 8px 14px' }}>
          <input
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend();
            }}
            placeholder="이 자리에 대해 더 물어보기…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 14, color: Z.ink }}
          />
          <button
            onClick={onSend}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M2 8h10M8 3l5 5-5 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <QASheet openQ={openQ} loggedIn={loggedIn} onClose={() => setOpenQ(null)} onUnlock={() => nav.requireLogin('ai', () => {})} />
      <ShareSheet open={share} onClose={() => setShare(false)} showToast={showToast} />
      <Toast msg={toast} />
    </div>
  );
}