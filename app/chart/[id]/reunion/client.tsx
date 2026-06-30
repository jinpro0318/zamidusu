"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Z, SERIF, SANS } from "@/theme/tokens";
import { BackBar } from "@/components/ziwei/common";
import { AiText, buildGlossary } from "@/components/ai/AiText";
import { UncertainTimeBadge } from "@/components/ziwei/UncertainTimeBadge";
import { useNav } from "@/components/ziwei/use-nav";

const INIT_PROMPT =
  "헤어진 인연과의 재회 가능성, 마음의 준비, 좋은 시기를 이 명반을 바탕으로 따뜻하게 풀어주세요. " +
  "대괄호 머리글이나 목록 없이 자연스러운 문단으로, 현재 상황 → 재회 가능성과 근거 → 좋은 시기 → 마음 준비 흐름으로 부탁드려요.";

function cleanMd(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

export function ReunionClient({
  chartId,
  subjectName,
  timeUncertain,
}: {
  chartId: string;
  subjectName?: string;
  timeUncertain?: boolean;
}) {
  const nav = useNav(chartId);
  const triggered = useRef(false);

  const { messages, status, append, reload } = useChat({
    api: "/api/ai/chat",
    body: { chartId, mode: "reunion" },
    onError: (e) => console.error("[Reunion AI] 호출 실패", { chartId, error: e }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const answer = messages.find((m) => m.role === "assistant")?.content ?? "";
  const hasAnswer = answer.trim().length > 0;
  const failed = !isLoading && messages.length > 0 && !hasAnswer;
  const cleaned = useMemo(() => cleanMd(answer), [answer]);
  const glossary = useMemo(() => buildGlossary(cleaned), [cleaned]);

  useEffect(() => {
    if (triggered.current || !chartId) return;
    triggered.current = true;
    append({ role: "user", content: INIT_PROMPT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  return (
    <div style={{ minHeight: "100%", background: Z.cream, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes zmds-dot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      <BackBar nav={nav} title="재회운 분석" />

      <div style={{ padding: "0 20px 48px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 헤더 */}
        <div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.p600, letterSpacing: "0.04em" }}>
            🌙 재회운 분석
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, color: Z.ink, margin: "4px 0 0" }}>
            {subjectName ? `${subjectName}의 재회운` : "재회 가능성 풀이"}
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink3, marginTop: 6, lineHeight: 1.55 }}>
            헤어진 인연과의 재회 가능성, 마음의 준비, 좋은 시기를 명반에서 읽어드려요.
          </p>
        </div>

        {timeUncertain && <UncertainTimeBadge />}

        {/* 로딩 */}
        {isLoading && !hasAnswer && (
          <div style={{ display: "flex", gap: 5, padding: "20px 0", justifyContent: "center" }}>
            {[0, 160, 320].map((delay) => (
              <span
                key={delay}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: Z.p500,
                  animation: `zmds-dot 1s ease-in-out ${delay}ms infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* 실패 */}
        {failed && (
          <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2, marginBottom: 12 }}>
              풀이를 불러오지 못했어요.
            </div>
            <button
              onClick={() => { triggered.current = false; reload(); }}
              style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: Z.p600, background: "transparent", border: `1.5px solid ${Z.p300}`, borderRadius: 10, padding: "8px 18px", cursor: "pointer" }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 본문 */}
        {hasAnswer && (
          <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: "18px 18px", fontFamily: SANS, fontSize: 14.5, color: Z.ink, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            <AiText text={cleaned} glossary={glossary} />
            {isLoading && (
              <span style={{ display: "inline-flex", gap: 4, marginLeft: 4, verticalAlign: "middle" }}>
                {[0, 160, 320].map((d) => (
                  <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: Z.p500, animation: `zmds-dot 1s ease-in-out ${d}ms infinite`, display: "inline-block" }} />
                ))}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
