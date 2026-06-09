// 명궁(命宮)을 결과 페이지 상단에 큰 히어로 카드로 표시.
// 시각 위계: ⭐ 아이콘 → 한 줄 설명 → 주성 큰 chip → 사화 표기.

import type { AstrolabePayload } from "@/lib/iztro/types";
import { metaFor } from "@/lib/iztro/palace-meta";
import { Star } from "lucide-react";

const MUTAGEN_LABEL: Record<string, { key: string; cls: string; meaning: string }> = {
  화록: { key: "祿", cls: "mut-lu", meaning: "재복·기회의 흐름" },
  화권: { key: "權", cls: "mut-quan", meaning: "권력·성취의 동력" },
  화과: { key: "科", cls: "mut-ke", meaning: "명예·학문의 빛" },
  화기: { key: "忌", cls: "mut-ji", meaning: "갈등·근심의 자리" },
};

export function SoulHero({ payload }: { payload: AstrolabePayload }) {
  const soul = payload.palaces.find((p) => p.name.includes("명"));
  if (!soul) return null;
  const meta = metaFor(soul.name);

  const mutagens = soul.majorStars
    .filter((s) => s.mutagen)
    .map((s) => ({ star: s.name, ...MUTAGEN_LABEL[s.mutagen!] }));

  return (
    <section className="palace-card palace-card-soul rounded-2xl p-5 sm:p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs gold-text tracking-wider">
            <Star className="size-3" />
            COMMAND OF FATE
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold leading-tight">
            <span className="gold-text">{meta.shortName}</span>
            <span className="text-muted text-base sm:text-lg ml-2 font-normal">{meta.longName}</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">{meta.description}</p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-[10px] text-muted tracking-wider">干支</p>
          <p className="font-display text-xl gold-text">
            {soul.heavenlyStem}
            {soul.earthlyBranch}
          </p>
        </div>
      </div>

      {/* 주성 (큰 chip) */}
      <div className="flex flex-wrap gap-2">
        {soul.majorStars.length === 0 ? (
          <span className="text-sm text-muted italic">공궁(空宮) — 자아 표현이 유연합니다</span>
        ) : (
          soul.majorStars.map((s, i) => (
            <div
              key={i}
              className="palace-card rounded-lg px-3 py-2 border-gold/40 bg-gold/10"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-display text-base sm:text-lg font-bold gold-text">
                  {s.name}
                </span>
                {s.brightness && (
                  <span className="text-[10px] text-muted tracking-wider">{s.brightness}</span>
                )}
              </div>
              {s.mutagen && (
                <p className="mt-0.5 text-[10px]">
                  <span className={`font-display ${MUTAGEN_LABEL[s.mutagen]?.cls ?? "gold-text"}`}>
                    {MUTAGEN_LABEL[s.mutagen]?.key ?? s.mutagen}
                  </span>
                  <span className="text-muted ml-1">
                    {MUTAGEN_LABEL[s.mutagen]?.meaning ?? s.mutagen}
                  </span>
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 사화 요약 (있을 때) */}
      {mutagens.length > 0 && (
        <>
          <div className="divider-dotted" />
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-muted">사화(四化)</span>
            {mutagens.map((m, i) => (
              <span key={i} className={`font-display ${m.cls}`}>
                {m.star} {m.key}
              </span>
            ))}
          </div>
        </>
      )}

      {/* 핵심 메타 — 3 grid */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <Meta label="命主" value={payload.soul} />
        <Meta label="身主" value={payload.body} />
        <Meta label="五行局" value={payload.fiveElementsClass} />
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="palace-card rounded-md p-2.5 text-center">
      <p className="text-[10px] text-muted tracking-wider">{label}</p>
      <p className="font-display text-sm sm:text-base gold-text mt-0.5">{value}</p>
    </div>
  );
}
