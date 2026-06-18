'use client';

// components/timeline/TimelineAnalysis.tsx
// 대운 타임라인 그래프 아래 "연령대별 흐름 분석" — 각 대운 구간별 2~3문장(시기 흐름 전용).
// /api/ai/chat mode:"timeline"로 호출, DeepReading(section="timeline") 캐시 재사용. 로그인 전용.
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SANS } from '@/theme/tokens';
import { AiText, buildGlossary } from '@/components/ai/AiText';
import { TIMELINE_INIT_PROMPT } from '@/lib/ai/prompt-builder';

// "[16-25]" 같은 나이 구간 머리글로 블록 분리.
const RANGE_RE = /\[+(\d{1,3}\s*-\s*\d{1,3})\]+/g;

function parseBlocks(text: string): { range: string; body: string }[] | null {
  const found = [...text.matchAll(RANGE_RE)];
  if (found.length < 2) return null;
  return found.map((m, i) => ({
    range: m[1].replace(/\s/g, ''),
    body: text.slice((m.index ?? 0) + m[0].length, found[i + 1]?.index ?? text.length).trim(),
  }));
}

function cleanMd(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[-*]\s+/gm, '• ');
}

export function TimelineAnalysis({ chartId }: { chartId: string }) {
  const triggered = useRef(false);
  const { messages, status, append, reload } = useChat({
    api: '/api/ai/chat',
    body: { chartId, mode: 'timeline' },
    onError: (e) => console.error('[Timeline AI] 흐름 분석 호출 실패', { chartId, error: e }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: 'user', content: TIMELINE_INIT_PROMPT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  const answer = messages.find((m) => m.role === 'assistant')?.content ?? '';
  const hasAnswer = answer.trim().length > 0;
  const failed = !isLoading && messages.length > 0 && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const blocks = hasAnswer ? parseBlocks(cleaned) : null;
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>

      {hasAnswer && blocks &&
        blocks.map((b, i) => (
          <div
            key={`${b.range}-${i}`}
            style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 14, padding: '13px 15px' }}
          >
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: Z.p600, marginBottom: 6 }}>{b.range}세</div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              <AiText text={b.body} glossary={glossary} />
            </div>
          </div>
        ))}

      {/* 머리글 파싱 실패/스트리밍 초반 — 통짜 폴백 */}
      {hasAnswer && !blocks && (
        <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 14, padding: '13px 15px', fontFamily: SANS, fontSize: 13.5, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          <AiText text={cleaned} glossary={glossary} />
        </div>
      )}

      {isLoading && !hasAnswer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 0' }}>
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: Z.p500, animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`, display: 'inline-block' }} />
            ))}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2 }}>연령대별 흐름을 분석하고 있어요…</span>
        </div>
      )}

      {failed && (
        <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2 }}>지금 분석을 불러오지 못했어요.</span>
          <button
            onClick={() => reload()}
            style={{ alignSelf: 'center', cursor: 'pointer', border: `1.5px solid ${Z.p100}`, background: Z.white, borderRadius: 12, padding: '9px 16px', fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.p600 }}
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
