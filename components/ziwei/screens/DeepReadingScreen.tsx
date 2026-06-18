'use client';

// screens/DeepReadingScreen.tsx — 깊은 풀이(궁을 "가로지르는" 종합) 표시.
// useChat(mode:"deep")로 /api/ai/chat를 호출하고 분야별 섹션([성격·기질]/[일·공부운]/[연애·인간관계운]/[재물운]/[마음·건강운]/[개운법])을
// 파싱해 렌더한다. 결제(PAID) 게이트는 서버(page.tsx)에서 이미 통과한 상태로만 진입한다.
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { BackBar } from '@/components/ziwei/common';
import { AiText, buildGlossary, TermLegend } from '@/components/ai/AiText';
import { UncertainTimeBadge } from '@/components/ziwei/UncertainTimeBadge';
import { DEEP_READING_INIT_PROMPT } from '@/lib/ai/prompt-builder';
import type { Nav } from '@/lib/ziwei-types';

const DEEP_TITLE_RE = /\[+(성격·기질|일·공부운|연애·인간관계운|재물운|마음·건강운|개운법)\]+/g;

function parseSections(text: string): { title: string; body: string }[] | null {
  const found = [...text.matchAll(DEEP_TITLE_RE)];
  if (found.length < 2) return null;
  return found.map((m, i) => ({
    title: m[1],
    body: text.slice((m.index ?? 0) + m[0].length, found[i + 1]?.index ?? text.length).trim(),
  }));
}

function cleanMd(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ');
}

export function DeepReadingScreen({
  nav,
  chartId,
  subjectName,
  timeUncertain,
}: {
  nav: Nav;
  chartId: string;
  subjectName?: string;
  timeUncertain?: boolean;
}) {
  const triggered = useRef(false);
  const { messages, input, handleInputChange, handleSubmit, status, append, reload } = useChat({
    api: '/api/ai/chat',
    body: { chartId, mode: 'deep' },
    onError: (e) => console.error('[Deep AI] 깊은풀이 호출 실패', { chartId, error: e }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: 'user', content: DEEP_READING_INIT_PROMPT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  // 초기 종합 풀이(첫 assistant 답변)와, 그 뒤 이어지는 후속 Q&A를 분리.
  const visibleMessages = messages.filter((m) => m.content !== DEEP_READING_INIT_PROMPT);
  const answer = messages.find((m) => m.role === 'assistant')?.content ?? '';
  const hasAnswer = answer.trim().length > 0;
  const requested = messages.length > 0;
  const failed = !isLoading && requested && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const sections = hasAnswer ? parseSections(cleaned) : null;
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  const firstAssistantIdx = visibleMessages.findIndex((m) => m.role === 'assistant');
  const followUps = firstAssistantIdx >= 0 ? visibleMessages.slice(firstAssistantIdx + 1) : [];

  // ── 추천 질문 칩: 올해 일/연애/재물 1인칭 질문(전체풀이 맥락의 짧은 후속 풀이) ──
  const suggested = ['올해 제 일·직장운이 궁금해요', '올해 제 연애·관계운이 궁금해요', '올해 제 재물운이 궁금해요'];
  const askSuggested = (q: string) => {
    if (isLoading || !hasAnswer) return;
    append({ role: 'user', content: `${q} 핵심만 짧게 알려주세요.` });
  };

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      <BackBar nav={nav} title="깊은 풀이" />
      <div style={{ padding: '0 20px 150px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, letterSpacing: '0.04em' }}>
            ✦ 12궁을 가로지르는 종합 풀이
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, color: Z.ink, margin: '4px 0 0' }}>
            {subjectName ? `${subjectName}의 깊은 풀이` : '내게 맞는 깊은 풀이'}
          </h1>
        </div>

        {timeUncertain && <UncertainTimeBadge />}

        {/* 상단 안내 범례 — 용어 마킹이 있을 때만(대화형 풀이엔 마킹이 없어 숨김) */}
        {hasAnswer && Object.keys(glossary).length > 0 && <TermLegend />}

        {hasAnswer && sections &&
          sections.map((sec, i) => (
            <div
              key={`${sec.title}-${i}`}
              style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: '15px 16px' }}
            >
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: Z.p600, marginBottom: 8 }}>{sec.title}</div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                <AiText text={sec.body} glossary={glossary} />
              </div>
            </div>
          ))}

        {/* 섹션 머리글이 아직 안 나온 스트리밍 초반/폴백 — 통짜 렌더 */}
        {hasAnswer && !sections && (
          <div
            style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: '15px 16px', fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
          >
            <AiText text={cleaned} glossary={glossary} />
          </div>
        )}

        {isLoading && !hasAnswer && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: Z.p500, animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }}
                />
              ))}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2 }}>깊은 풀이를 짓고 있어요…</span>
          </div>
        )}

        {failed && (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2 }}>지금 풀이를 불러오지 못했어요.</span>
            <button
              onClick={() => reload()}
              style={{ alignSelf: 'center', cursor: 'pointer', border: `1.5px solid ${Z.p100}`, background: Z.white, borderRadius: 12, padding: '10px 18px', fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.p600 }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* ── 후속 질문 대화 (칩/입력으로 이어지는 짧은 풀이) ── */}
        {followUps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ height: 1, background: Z.line }} />
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.ink2 }}>이어서 물어봤어요</div>
            {followUps.map((m) => (
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
                  fontFamily: SANS, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap',
                }}
              >
                {m.role === 'user' ? m.content : <AiText text={cleanMd(m.content)} glossary={glossary} />}
              </div>
            ))}
            {isLoading && followUps.at(-1)?.role === 'user' && (
              <div style={{
                alignSelf: 'flex-start', background: Z.white, border: `1px solid ${Z.line}`,
                borderRadius: '18px 18px 18px 5px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: Z.p500, animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── 추천 질문 칩 + 이어 묻기 입력 (sticky) — 초기 풀이가 나온 뒤에만 노출 ── */}
      {hasAnswer && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            padding: '8px 0 max(18px, env(safe-area-inset-bottom))',
            background: `linear-gradient(to top, ${Z.cream} 82%, transparent)`,
          }}
        >
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 16px 9px', WebkitOverflowScrolling: 'touch' }}>
            {suggested.map((q) => (
              <button
                key={q}
                onClick={() => askSuggested(q)}
                disabled={isLoading}
                style={{
                  flexShrink: 0, cursor: isLoading ? 'default' : 'pointer',
                  fontFamily: SANS, fontSize: 12.5, fontWeight: 600,
                  color: isLoading ? Z.ink3 : Z.p600,
                  background: Z.white, border: `1.5px solid ${Z.p100}`,
                  borderRadius: 18, padding: '7px 13px',
                  boxShadow: '0 2px 8px rgba(36,26,61,0.06)', whiteSpace: 'nowrap',
                }}
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
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
                aria-label="질문 보내기"
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: isLoading || !input.trim() ? 'default' : 'pointer',
                  background: isLoading || !input.trim() ? Z.line : `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke={isLoading || !input.trim() ? Z.ink3 : '#fff'} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
