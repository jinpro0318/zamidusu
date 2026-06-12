'use client';

// screens/Detail.tsx — palace detail with auto-triggered full AI interpretation
import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { AREA_INFO } from '@/data/areaInfo';
import type { Area, Nav, NavParams } from '@/lib/ziwei-types';

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
  const key = params?.key || '命宮';
  const a = allAreas.find((x) => x.cn === key) || allAreas[0];
  const info = AREA_INFO[key] || { about: '', star: '', ai: '' };

  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  // 자동 트리거할 초기 프롬프트 — AI 응답만 표시하고 이 메시지는 숨김
  const initPrompt = `${a.ko}(${a.cn})에 대한 자미두수 풀이를 상세하게 해주세요. 이 자리에 위치한 별들의 특성과 밝기, 별들 사이의 상호작용, 그리고 제 삶의 이 영역에서 어떤 경향과 가능성이 보이는지 단계적으로 풀어주세요. 마지막에는 이 명반을 가진 사람이 실생활에서 어떻게 활용하면 좋은지 구체적인 조언도 해주세요.`;

  const { messages, input, handleInputChange, handleSubmit, status, append } = useChat({
    api: '/api/ai/chat',
    body: { chartId, palaceKey: key },
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  // 페이지 진입 시 자동으로 풀이 요청
  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: 'user', content: initPrompt });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  // 새 메시지 스트리밍 시 하단 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 초기 자동 요청 메시지는 UI에서 숨김 (사용자에게 보여줄 필요 없음)
  const visibleMessages = messages.filter((m) => m.content !== initPrompt);

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${Z.p900}, ${Z.p800})`,
          padding: 'calc(env(safe-area-inset-top) + 16px) 14px 22px',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexShrink: 0,
        }}
      >
        <StarField count={20} gold={3} seed={12} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => nav.back()}
            aria-label="뒤로가기"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path d="M10 2L2 10l8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => nav.requireLogin('share', () => setShare(true))}
            style={{ border: 'none', background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`, cursor: 'pointer', borderRadius: 16, padding: '7px 14px', fontFamily: SANS, fontSize: 12.5, color: Z.ink, fontWeight: 700 }}
          >
            공유
          </button>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center', marginTop: 10, padding: '0 4px' }}>
          <AreaIcon h={a.h} size={56} sel />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>{a.ko}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{a.cn}</span>
              {a.stars.map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: SERIF, fontSize: 12.5, color: Z.goldBright,
                    background: 'rgba(227,195,107,0.15)', border: '1px solid rgba(227,195,107,0.32)',
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

      {/* 스크롤 본문 */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 130px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* 이 자리는? — 컨텍스트 카드 */}
        <div style={{ background: Z.p50, border: `1px solid ${Z.p100}`, borderRadius: 16, padding: '13px 16px' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>이 자리는?</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.55 }}>{info.about}</div>
        </div>

        {/* AI 풀이 섹션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(180deg,${Z.p500},${Z.p700})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#fff" />
              </svg>
            </span>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink }}>
              자미두수 AI 풀이
            </span>
            {isLoading && (
              <span style={{ fontFamily: SANS, fontSize: 12, color: Z.p600, fontWeight: 600 }}>생성 중…</span>
            )}
          </div>

          {/* AI 응답 — 스트리밍 */}
          {visibleMessages.filter((m) => m.role === 'assistant').map((m) => (
            <div
              key={m.id}
              style={{
                background: Z.white, border: `1px solid ${Z.line}`,
                borderRadius: 18, padding: '16px 18px',
                fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}

          {/* 로딩 중이고 아직 응답이 없을 때 */}
          {isLoading && visibleMessages.filter((m) => m.role === 'assistant').length === 0 && (
            <div style={{
              background: Z.white, border: `1px solid ${Z.line}`,
              borderRadius: 18, padding: '16px 18px',
              fontFamily: SANS, fontSize: 14, color: Z.ink3, lineHeight: 1.6,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: Z.p500,
                      animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </span>
              <span>{a.ko} 풀이를 생성하고 있어요</span>
            </div>
          )}
        </div>

        {/* 추가 질문 메시지들 (사용자 질문 + 후속 AI 응답) */}
        {visibleMessages.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ height: 1, background: Z.line }} />
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.ink2 }}>추가 질문</div>
            {visibleMessages.slice(1).map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: m.role === 'user' ? `linear-gradient(180deg,${Z.p600},${Z.p700})` : Z.white,
                  color: m.role === 'user' ? '#fff' : Z.ink,
                  border: m.role === 'user' ? 'none' : `1px solid ${Z.line}`,
                  borderRadius: m.role === 'user' ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                  padding: '12px 16px',
                  fontFamily: SANS, fontSize: 14, lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {isLoading && visibleMessages.at(-1)?.role === 'user' && (
              <div style={{
                alignSelf: 'flex-start',
                background: Z.white, border: `1px solid ${Z.line}`,
                borderRadius: '18px 18px 18px 5px', padding: '12px 16px',
                fontFamily: SANS, fontSize: 13, color: Z.ink3,
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 6, height: 6, borderRadius: '50%', background: Z.p500,
                      animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 점 애니메이션 keyframe */}
      <style>{`
        @keyframes zmds-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* sticky 채팅 입력 */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '10px 16px max(18px, env(safe-area-inset-bottom))',
          background: `linear-gradient(to top, ${Z.cream} 75%, transparent)`,
        }}
      >
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', background: Z.white, border: `1.5px solid ${Z.p100}`, borderRadius: 18, padding: '9px 9px 9px 16px', boxShadow: '0 4px 16px rgba(36,26,61,0.08)' }}>
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="더 궁금한 점을 물어보세요…"
            disabled={isLoading}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: SANS, fontSize: 14, color: Z.ink }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: isLoading || !input.trim() ? 'default' : 'pointer',
              background: isLoading || !input.trim() ? Z.line : `linear-gradient(180deg,${Z.p500},${Z.p700})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={isLoading || !input.trim() ? Z.ink3 : '#fff'} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>

      <ShareSheet open={share} onClose={() => setShare(false)} showToast={showToast} />
      <Toast msg={toast} />
    </div>
  );
}
