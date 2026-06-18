'use client';

// screens/DeepReadingScreen.tsx — 깊은 풀이(궁을 "가로지르는" 종합) 표시.
// useChat(mode:"deep")로 /api/ai/chat를 호출하고 분야별 섹션([성격·기질]/[일·공부운]/[연애·인간관계운]/[재물운]/[마음·건강운]/[개운법])을
// 파싱해 렌더한다. 결제(PAID) 게이트는 서버(page.tsx)에서 이미 통과한 상태로만 진입한다.
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { BackBar } from '@/components/ziwei/common';
import { AiText, buildGlossary, TermLegend } from '@/components/ai/AiText';
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
}: {
  nav: Nav;
  chartId: string;
  subjectName?: string;
}) {
  const triggered = useRef(false);
  const { messages, status, append, reload } = useChat({
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

  const answer = messages.find((m) => m.role === 'assistant')?.content ?? '';
  const hasAnswer = answer.trim().length > 0;
  const requested = messages.length > 0;
  const failed = !isLoading && requested && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const sections = hasAnswer ? parseSections(cleaned) : null;
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      <BackBar nav={nav} title="깊은 풀이" />
      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, letterSpacing: '0.04em' }}>
            ✦ 12궁을 가로지르는 종합 풀이
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, color: Z.ink, margin: '4px 0 0' }}>
            {subjectName ? `${subjectName}의 깊은 풀이` : '내게 맞는 깊은 풀이'}
          </h1>
        </div>

        {/* 상단 안내 범례 — 본문 위에 둬서 "탭하면 뜻풀이"를 먼저 알게 한다 */}
        {hasAnswer && sections && <TermLegend />}

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

      </div>
    </div>
  );
}
