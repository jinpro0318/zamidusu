'use client';

// components/compatibility/CompatibilityReading.tsx
// 궁합 결과 하단의 AI 관계 해석. /api/compatibility/reading 스트리밍 + DeepReading 캐시 재사용.
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SANS } from '@/theme/tokens';
import { AiText, buildGlossary } from '@/components/ai/AiText';
import { COMPAT_INIT_PROMPT } from '@/lib/ai/prompt-builder';

const SECTION_RE = /\[+(관계 총평|애정·끌림|소통|재물·현실|갈등·주의)\]+/g;

function parseSections(text: string): { title: string; body: string }[] | null {
  const found = [...text.matchAll(SECTION_RE)];
  if (found.length < 2) return null;
  return found.map((m, i) => ({
    title: m[1],
    body: text.slice((m.index ?? 0) + m[0].length, found[i + 1]?.index ?? text.length).trim(),
  }));
}
function cleanMd(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[-*]\s+/gm, '• ');
}

export function CompatibilityReading({ compatId }: { compatId: string }) {
  const triggered = useRef(false);
  const { messages, status, append, reload } = useChat({
    api: '/api/compatibility/reading',
    body: { compatId },
    onError: (e) => console.error('[Compat AI] 해석 호출 실패', { compatId, error: e }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (triggered.current || !compatId) return;
    triggered.current = true;
    append({ role: 'user', content: COMPAT_INIT_PROMPT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compatId]);

  const answer = messages.find((m) => m.role === 'assistant')?.content ?? '';
  const hasAnswer = answer.trim().length > 0;
  const failed = !isLoading && messages.length > 0 && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const sections = hasAnswer ? parseSections(cleaned) : null;
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      <h2 style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: Z.p600, margin: 0 }}>두 사람 관계 풀이</h2>

      {hasAnswer && sections &&
        sections.map((sec, i) => (
          <div key={`${sec.title}-${i}`} style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 15px' }}>
            <div style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: Z.ink, marginBottom: 7 }}>{sec.title}</div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              <AiText text={sec.body} glossary={glossary} />
            </div>
          </div>
        ))}

      {hasAnswer && !sections && (
        <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 15px', fontFamily: SANS, fontSize: 13.5, color: Z.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
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
          <span style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2 }}>두 사람의 관계를 풀이하고 있어요…</span>
        </div>
      )}

      {failed && (
        <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2 }}>지금 풀이를 불러오지 못했어요.</span>
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
