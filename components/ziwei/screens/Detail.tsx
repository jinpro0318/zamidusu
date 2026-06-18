'use client';

// screens/Detail.tsx — palace detail: 즉답 요약 → 구조화 AI 본문 → 대화형 심화
import { useRef, useEffect, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { AreaIcon, Brightness, StarField } from '@/components/ziwei/atoms';
import { ShareSheet } from '@/components/ziwei/sheets/ShareSheet';
import { Toast } from '@/components/ziwei/sheets/Toast';
import { useToast } from '@/hooks/useToast';
import { AiText, buildGlossary, TermLegend } from '@/components/ai/AiText';
import { UncertainTimeBadge } from '@/components/ziwei/UncertainTimeBadge';
import { AREAS as DEFAULT_AREAS } from '@/data/areas';
import { AREA_INFO } from '@/data/areaInfo';
import { QUESTIONS } from '@/data/questions';
import { STAR_MEANINGS } from '@/data/starMeanings';
import { starKo } from '@/lib/star-names';
import { annotateStar, annotatePalace } from '@/lib/glossary';
import type { Area, Nav, NavParams } from '@/lib/ziwei-types';

const SECTION_TITLES = ['평소 모습', '잘 풀릴 때', '힘 빠질 때', '이렇게 해보세요'] as const;

// AI 본문을 위 4개 마커로 분리. 마커가 2개 미만이면 null(통짜 폴백).
// 모델이 용어 마킹([[...]])에 이끌려 머리글을 겹대괄호로 내보내기도 하므로,
// 대괄호를 1개 이상([+ ... ]+) 허용해 본문에 stray 괄호가 남지 않도록 통째로 소비한다.
function parseSections(text: string): { title: string; body: string }[] | null {
  const re = /\[+(평소 모습|잘 풀릴 때|힘 빠질 때|이렇게 해보세요)\]+/g;
  const found = [...text.matchAll(re)];
  if (found.length < 2) return null;
  return found.map((m, i) => ({
    title: m[1],
    body: text.slice((m.index ?? 0) + m[0].length, found[i + 1]?.index ?? text.length).trim(),
  }));
}

// 마크다운 잔여 기호 정리 (프롬프트에서 금지하지만 안전망)
function cleanMd(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ');
}

export function Detail({
  nav, params, loggedIn, areas, chartId, timeUncertain = false,
}: {
  nav: Nav;
  params?: NavParams;
  loggedIn: boolean;
  areas?: Area[];
  chartId?: string;
  timeUncertain?: boolean;
}) {
  const allAreas = areas && areas.length ? areas : DEFAULT_AREAS;
  const key = params?.key || '命宮';
  const a = allAreas.find((x) => x.cn === key) || allAreas[0];
  const info = AREA_INFO[key] || { headline: '', summary: '', detail: '' };

  const [share, setShare] = useState(false);
  const [toast, showToast] = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  // ── 1단: 즉답 요약 (결정적 — AI와 무관하게 항상 표시) ──
  const majorKoNames = a.stars.map(starKo);
  const kw: string[] = [];
  for (const s of majorKoNames) kw.push(...(STAR_MEANINGS[s]?.keywords ?? []));
  for (const s of a.subStars ?? []) {
    if (kw.length >= 5) break;
    kw.push(...(STAR_MEANINGS[s]?.keywords ?? []).slice(0, 1));
  }
  const keywords = [...new Set(kw)].slice(0, 5);

  // ── 2단: 구조화 AI 본문 ──
  const initPrompt = `${a.ko}(${a.cn})를 중심으로, 옆에서 상담하듯 대화형으로 풀어주세요. 대괄호 머리글·목록·특수 토큰 없이 자연스러운 문단으로, 도입 공감 → 마음 읽기 질문 → 명반 근거 본문 → 응원 마무리 흐름으로 들려주세요. 이 자리의 별(주성·보조성)과 밝기를 근거로, 제가 실제 일상·관계·일에서 어떻게 느끼고 겪는지를 구체적인 장면과 감정으로 풀어주세요.`;

  const { messages, input, handleInputChange, handleSubmit, status, append, error, reload } = useChat({
    api: '/api/ai/chat',
    body: { chartId, palaceKey: key },
    onError: (e) => console.error('[Detail AI] 풀이 호출 실패', { palaceKey: key, chartId, error: e }),
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: 'user', content: initPrompt });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  // 새 사용자 질문 전송 시에만 하단 스크롤 (본문 스트리밍 중에는 읽기 방해 금지)
  useEffect(() => {
    if (messages.at(-1)?.role === 'user' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const visibleMessages = messages.filter((m) => m.content !== initPrompt);
  const assistantMsgs = visibleMessages.filter((m) => m.role === 'assistant');
  const mainAnswer = assistantMsgs[0]?.content ?? '';
  const hasAnswer = mainAnswer.trim().length > 0;
  const requested = messages.length > 0;
  const aiFailed = !isLoading && requested && !hasAnswer;

  useEffect(() => {
    if (!isLoading && requested && !hasAnswer && !error && messages.length > 0) {
      console.error('[Detail AI] 빈 응답 수신 (스트림 비정상 종료 추정)', { palaceKey: key, chartId });
    }
  }, [isLoading, requested, hasAnswer, error, messages.length, key, chartId]);

  const retry = () => {
    console.warn('[Detail AI] 사용자 재시도', { palaceKey: key, chartId });
    reload();
  };

  const sections = hasAnswer ? parseSections(cleanMd(mainAnswer)) : null;
  // 응답 전체 기준 용어 사전 — 섹션별로 쪼개 렌더하므로, 설명이 생략된 3필드 마킹의
  // 설명을 다른 섹션의 마킹에서 재사용하려면 전체 답변에서 한 번에 모아 내려줘야 한다.
  const glossary = useMemo(() => buildGlossary(cleanMd(mainAnswer)), [mainAnswer]);

  // 첫 assistant 응답 이후의 후속 대화 (사용자 질문 + 추가 답변)
  const firstAssistantIdx = visibleMessages.findIndex((m) => m.role === 'assistant');
  const followUps = firstAssistantIdx >= 0 ? visibleMessages.slice(firstAssistantIdx + 1) : [];

  // ── 4단(입력): 추천 질문 칩 — 이 궁 주제의 1인칭 질문 3개(올해 흐름 중심) ──
  const suggested = [...new Set(QUESTIONS[key]?.map((q) => q.q).slice(0, 3) ?? ['올해 제 흐름이 궁금해요'])];
  const askSuggested = (q: string) => {
    if (isLoading) return;
    append({ role: 'user', content: q });
  };

  return (
    <div style={{ minHeight: '100%', background: Z.cream, display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div
        style={{
          position: 'relative', overflow: 'hidden',
          background: `linear-gradient(160deg, ${Z.p900}, ${Z.p800})`,
          padding: 'calc(env(safe-area-inset-top) + 16px) 14px 22px',
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexShrink: 0,
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
              <span style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{annotatePalace(a.cn)}</span>
              {a.stars.length > 0 ? (
                a.stars.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontFamily: SERIF, fontSize: 12.5, color: Z.goldBright,
                      background: 'rgba(227,195,107,0.15)', border: '1px solid rgba(227,195,107,0.32)',
                      borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap',
                    }}
                  >
                    ★{annotateStar(s)}
                  </span>
                ))
              ) : (
                <span
                  style={{
                    fontFamily: SERIF, fontSize: 12.5, color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, padding: '2px 8px', whiteSpace: 'nowrap',
                  }}
                >
                  空宮
                </span>
              )}
              {(a.subStars ?? []).map((s) => (
                <span
                  key={s}
                  style={{
                    fontFamily: SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.75)',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 8, padding: '2px 7px', whiteSpace: 'nowrap',
                  }}
                >
                  {annotateStar(s)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 본문 */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 170px', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* ── 1단: 즉답 요약 (항상 표시) ── */}
        <div
          style={{
            background: `linear-gradient(170deg, ${Z.p50}, #fff)`,
            border: `1.5px solid ${Z.p100}`, borderRadius: 16, padding: '14px 16px',
          }}
        >
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, marginBottom: 8, letterSpacing: '0.04em' }}>한눈에 보기</div>
          {keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 9 }}>
              {keywords.map((k2) => (
                <span
                  key={k2}
                  style={{
                    fontFamily: SANS, fontSize: 12.5, fontWeight: 700,
                    color: '#9C7C1E', background: 'rgba(199,162,63,0.13)',
                    border: '1px solid rgba(199,162,63,0.4)',
                    borderRadius: 20, padding: '4px 11px',
                  }}
                >
                  #{k2}
                </span>
              ))}
            </div>
          )}
          <div style={{ fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.55, fontWeight: 600 }}>{a.line}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, lineHeight: 1.6, marginTop: 6 }}>{info.summary}</div>
        </div>

        {/* ── 2단: 구조화 AI 본문 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {timeUncertain && <UncertainTimeBadge />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(180deg,${Z.p500},${Z.p700})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#fff" />
              </svg>
            </span>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink }}>자미두수 AI 풀이</span>
            {isLoading && !hasAnswer && (
              <span style={{ fontFamily: SANS, fontSize: 12, color: Z.p600, fontWeight: 600 }}>생성 중…</span>
            )}
          </div>

          {/* 상단 안내 범례 — 용어 마킹이 있을 때만(대화형 풀이엔 마킹이 없어 숨김) */}
          {hasAnswer && Object.keys(glossary).length > 0 && <TermLegend />}

          {/* 성공: 섹션 카드 (마커 파싱 실패 시 통짜 폴백) */}
          {hasAnswer && sections && sections.map((sec, i) => (
            <div
              key={`${sec.title}-${i}`}
              style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '14px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`, display: 'inline-block' }} />
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.ink }}>{sec.title}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                <AiText text={sec.body} glossary={glossary} />
              </div>
            </div>
          ))}
          {hasAnswer && !sections && (
            <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: '16px 18px', fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              <AiText text={cleanMd(mainAnswer)} glossary={glossary} />
            </div>
          )}

          {/* 로딩 */}
          {isLoading && !hasAnswer && (
            <div style={{
              background: Z.white, border: `1px solid ${Z.line}`,
              borderRadius: 16, padding: '16px 18px',
              fontFamily: SANS, fontSize: 14, color: Z.ink3, lineHeight: 1.6,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 7, height: 7, borderRadius: '50%', background: Z.p500,
                      animation: `zmds-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </span>
              <span>{a.ko} 풀이를 생성하고 있어요</span>
            </div>
          )}

          {/* 실패 */}
          {aiFailed && (
            <div
              style={{
                background: Z.white, border: `1.5px solid ${Z.p100}`,
                borderRadius: 18, padding: '20px 18px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}
            >
              <span
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: Z.p50, border: `1px solid ${Z.p100}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v5M12 16.5v.5" stroke={Z.p600} strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke={Z.p600} strokeWidth="2" />
                </svg>
              </span>
              <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink, textAlign: 'center', lineHeight: 1.55 }}>
                지금 풀이를 불러오지 못했어요.
                <br />
                잠시 후 다시 시도해 주세요.
              </div>
              <button
                onClick={retry}
                style={{
                  border: 'none', cursor: 'pointer', borderRadius: 12,
                  padding: '10px 22px', fontFamily: SANS, fontSize: 14, fontWeight: 700,
                  color: '#fff', background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
                  boxShadow: '0 4px 14px rgba(94,71,160,0.3)',
                }}
              >
                다시 시도
              </button>
            </div>
          )}
        </div>

        {/* ── 3단: 대화형 심화 (후속 질문) ── */}
        {followUps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ height: 1, background: Z.line }} />
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.ink2 }}>추가 질문</div>
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
                  fontFamily: SANS, fontSize: 14, lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.role === 'user' ? m.content : <AiText text={m.content} glossary={glossary} />}
              </div>
            ))}
            {isLoading && followUps.at(-1)?.role === 'user' && (
              <div style={{
                alignSelf: 'flex-start',
                background: Z.white, border: `1px solid ${Z.line}`,
                borderRadius: '18px 18px 18px 5px', padding: '12px 16px',
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

      <style>{`
        @keyframes zmds-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ── 4단: 추천 질문 칩 + 채팅 입력 (sticky) ── */}
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
                boxShadow: '0 2px 8px rgba(36,26,61,0.06)',
                whiteSpace: 'nowrap',
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
      </div>

      <ShareSheet
        open={share}
        onClose={() => setShare(false)}
        showToast={showToast}
        soulStars={allAreas.find((x) => x.cn === '命宮')?.stars}
        chartId={chartId}
      />
      <Toast msg={toast} />
    </div>
  );
}
