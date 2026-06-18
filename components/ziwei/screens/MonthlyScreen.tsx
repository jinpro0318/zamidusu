'use client';

// screens/MonthlyScreen.tsx — 월간 운세(이번 달 흐름) 표시.
// useChat(mode:"monthly")로 /api/ai/chat를 호출. 달마다 새 캐시(section="monthly-YYYY-MM").
// 대화형 상담 톤(플로잉)으로 렌더 — 라이트 테마.
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { BackBar } from '@/components/ziwei/common';
import { AiText, buildGlossary } from '@/components/ai/AiText';
import { MONTHLY_INIT_PROMPT } from '@/lib/ai/prompt-builder';
import type { Nav } from '@/lib/ziwei-types';

function cleanMd(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ');
}

const MONTH_LABEL = (() => {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
})();

export function MonthlyScreen({
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
    body: { chartId, mode: 'monthly' },
    onError: (e) => console.error('[Monthly AI] 월간 운세 호출 실패', { chartId, error: e }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: 'user', content: MONTHLY_INIT_PROMPT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  const answer = messages.find((m) => m.role === 'assistant')?.content ?? '';
  const hasAnswer = answer.trim().length > 0;
  const requested = messages.length > 0;
  const failed = !isLoading && requested && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      <BackBar nav={nav} title="월간 운세" />
      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, letterSpacing: '0.04em' }}>
            🔔 이번 달 흐름 · {MONTH_LABEL}
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, color: Z.ink, margin: '4px 0 0' }}>
            {subjectName ? `${subjectName}의 이번 달 운세` : '이번 달 내 운세'}
          </h1>
        </div>

        {hasAnswer && (
          <div
            style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: '15px 16px', fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}
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
            <span style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2 }}>이번 달 운세를 살펴보고 있어요…</span>
          </div>
        )}

        {failed && (
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2 }}>지금 운세를 불러오지 못했어요.</span>
            <button
              onClick={() => reload()}
              style={{ alignSelf: 'center', cursor: 'pointer', border: `1.5px solid ${Z.p100}`, background: Z.white, borderRadius: 12, padding: '10px 18px', fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.p600 }}
            >
              다시 시도
            </button>
          </div>
        )}

        <p style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink3, lineHeight: 1.6, margin: '4px 4px 0' }}>
          ※ 매달 새로 업데이트돼요. 단정적 예언이 아니라 이번 달 흐름의 참고 가이드로 봐주세요.
        </p>
      </div>
    </div>
  );
}
