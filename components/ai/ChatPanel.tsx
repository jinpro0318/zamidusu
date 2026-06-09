"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "내 명궁(命宮)의 주성은 어떤 의미인가요?",
  "재백궁(財帛宮)을 풀어주세요.",
  "올해 2026년 운세는 어떤가요?",
  "부처궁(夫妻宮)으로 본 연애 경향이 궁금해요.",
];

export function ChatPanel({ chartId }: { chartId: string }) {
  const { messages, input, handleInputChange, handleSubmit, status, error, append } = useChat({
    api: "/api/ai/chat",
    body: { chartId },
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 -mr-1">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted leading-relaxed">
              명반을 컨텍스트로 자유롭게 질문하세요.
              <br />
              아래 추천 질문을 탭하거나 직접 입력해도 좋아요.
            </p>
            <div className="grid gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => append({ role: "user", content: q })}
                  className="palace-card rounded-lg p-3 text-left text-xs sm:text-sm hover:border-gold/50 active:scale-[0.98] transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-2xl px-4 py-3 max-w-[90%] text-sm",
              m.role === "user"
                ? "ml-auto bg-gold/15 border border-gold/30 rounded-br-md"
                : "mr-auto palace-card rounded-bl-md",
            )}
          >
            <p className="text-[10px] gold-text mb-1 tracking-wider">
              {m.role === "user" ? "나" : "AI"}
            </p>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}

        {error && (
          <div className="rounded-lg bg-rose/10 border border-rose/30 p-3 text-xs text-rose">
            {error.message || "요청 중 오류가 발생했습니다."}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-2 border-t border-white/5 sticky bottom-0 bg-purple-deep/60 backdrop-blur"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="명반에 대해 물어보세요…"
          disabled={isLoading}
          className="h-11"
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="h-11">
          {isLoading ? "..." : "전송"}
        </Button>
      </form>
    </div>
  );
}
