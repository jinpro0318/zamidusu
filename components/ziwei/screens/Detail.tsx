'use client';

// screens/Detail.tsx — single palace detail + suggested questions + AI chat
import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
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

export function Detail({
  nav, params, loggedIn, areas, chartId,
}: {
  nav: Nav;
  params?: NavParams;
  loggedIn: boolean;
  areas?: Area[];
  chartId?: string;
}) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const key = params?.key || '夫妻宮';
  const a = allAreas.find((x) => x.cn === key) || allAreas[0];
  const info = AREA_INFO[key] || { about: '', star: '', ai: '' };
  const qs = QUESTIONS[key] || [];
  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const [openQ, setOpenQ] = useState<SuggestedQuestion | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, status, append } = useChat({
    api: '/api/ai/chat',
    body: { chartId, palaceKey: key },
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  // 새 메시지가 쌓이면 스크롤 하단으로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQAOpen = (item: SuggestedQuestion) => {
    setOpenQ(item);
    // 추천 질문도 AI 채팅에 반영
    if (chartId) {
      append({ role: 'user', content: item.q });
    }
  };

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      {/* header band */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${Z.p900}, ${Z.p800})`,
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
            style={{ border: 'none', background: 'rgba(255,255,255,0.12)', cursor: 'pointer', borderRadius: 16, padding: '7px 12px', fontFamily: SANS, fontSize: 12.5, color: '#fff', fontWeight: 600 }}
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
                    fontFamily: SERIF, fontSize: 12.5, color: Z.goldBright,
                    background: 'rgba(227,195,107,0.15)', border: '1px solid rgba(227,195,107,0.35)',
                    borderRadius: 8, padding: '2px 8px',
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

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '18px 18px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 이 자리는? */}
        <div style={{ background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.p600, marginBottom: 5 }}>이 자리는?</div>
          <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.55 }}>{info.about}</div>
        </div>

        {/* 별 의미 */}
        <div>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink, marginBottom: 9 }}>이 자리의 별 · {a.stars.join('·')}</div>
          <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 16px', fontFamily: SANS, fontSize: 14, color: Z.ink2, lineHeight: 1.6 }}>
            {info.star}
          </div>
        </div>

        {/* AI 쉬운 풀이 (정적) */}
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
                onClick={() => handleQAOpen(item)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 11,
                  background: Z.white, border: `1.5px solid ${Z.p100}`,
                  borderRadius: 14, padding: '13px 14px',
                  boxShadow: '0 2px 10px rgba(36,26,61,0.04)',
                }}
              >
                <span
                  style={{
                    width: 27, height: 27, borderRadius: '50%', flexShrink: 0,
                    background: Z.p50, border: `1px solid ${Z.p100}`,
                    color: Z.p600, fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ?
                </span>
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: Z.ink }}>{item.q}</span>
                <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.p600, whiteSpace: 'nowrap' }}>AI 풀이 ›</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI 채팅 메시지 */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.ink, padding: '4px 0' }}>AI 해석 대화</div>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: m.role === 'user' ? `linear-gradient(180deg,${Z.p600},${Z.p700})` : Z.white,
                  color: m.role === 'user' ? '#fff' : Z.ink,
                  border: m.role === 'user' ? 'none' : `1px solid ${Z.line}`,
                  borderRadius: m.role === 'user' ? '16px 16px 5px 16px' : '16px 16px 16px 5px',
                  padding: '11px 14px',
                  fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start', background: Z.white, border: `1px solid ${Z.line}`,
                borderRadius: '16px 16px 16px 5px', padding: '11px 16px',
                fontFamily: SANS, fontSize: 13, color: Z.ink3,
              }}>
                해석 중…
              </div>
            )}
          </div>
        )}
      </div>

      {/* sticky 채팅 입력 */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '10px 14px max(16px, env(safe-area-inset-bottom))',
          background: `linear-gradient(to top, ${Z.cream} 78%, transparent)`,
          display: 'flex', gap: 9, alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: Z.white, border: `1.5px solid ${Z.p100}`, borderRadius: 16, padding: '8px 8px 8px 14px' }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={`${a.ko}에 대해 AI에게 물어보기…`}
            disabled={isLoading}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 14, color: Z.ink }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isLoading || !input.trim() ? Z.line : `linear-gradient(180deg,${Z.p500},${Z.p700})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M2 8h10M8 3l5 5-5 5" stroke={isLoading || !input.trim() ? Z.ink3 : '#fff'} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>

      <QASheet openQ={openQ} loggedIn={true} onClose={() => setOpenQ(null)} onUnlock={() => {}} />
      <ShareSheet open={share} onClose={() => setShare(false)} showToast={showToast} />
      <Toast msg={toast} />
    </div>
  );
}
