"use client";

import { useState } from "react";
import type { AstrolabePayload, PalaceLite } from "@/lib/iztro/types";
import { PalaceCard } from "./PalaceCard";

// 자미두수 명반은 전통적으로 4x4 그리드 (12궁 + 중앙 2x2 천반).
//   [巳] [午] [未] [申]
//   [辰] [   천반    ] [酉]
//   [卯] [           ] [戌]
//   [寅] [丑] [子] [亥]

const GRID_LAYOUT = [
  "巳", "午", "未", "申",
  "辰", null, null, "酉",
  "卯", null, null, "戌",
  "寅", "丑", "子", "亥",
];

export function ChartGrid({ payload }: { payload: AstrolabePayload }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const byBranch = new Map<string, PalaceLite>();
  for (const p of payload.palaces) byBranch.set(p.earthlyBranch, p);

  const active = activeIdx !== null ? payload.palaces[activeIdx] : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-4 gap-1 sm:gap-2.5">
        {GRID_LAYOUT.map((branch, gridIdx) => {
          if (branch === null) {
            if (gridIdx === 5) {
              return (
                <div
                  key={gridIdx}
                  className="col-span-2 row-span-2 palace-card flex flex-col items-center justify-center rounded-md sm:rounded-lg p-3 sm:p-5 text-center"
                >
                  <p className="text-[10px] sm:text-xs text-muted">命主 · 身主</p>
                  <p className="font-display text-base sm:text-2xl font-bold gold-text mt-1 sm:mt-2">
                    {payload.soul} / {payload.body}
                  </p>
                  <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted">五行局</p>
                  <p className="font-display text-sm sm:text-lg gold-text">{payload.fiveElementsClass}</p>
                  <p className="mt-2 sm:mt-3 text-[9px] sm:text-xs text-muted leading-tight">
                    {payload.solarDate}
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> · </span>
                    {payload.time}
                  </p>
                </div>
              );
            }
            return null;
          }

          const palace = byBranch.get(branch);
          if (!palace) {
            return (
              <div key={gridIdx} className="palace-card rounded-md p-2 opacity-30">
                <span className="text-xs">{branch}</span>
              </div>
            );
          }

          const idx = payload.palaces.findIndex((p) => p.earthlyBranch === branch);
          return (
            <PalaceCard
              key={gridIdx}
              palace={palace}
              active={activeIdx === idx}
              onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
            />
          );
        })}
      </div>

      {active && (
        <div className="palace-card rounded-xl p-4 sm:p-6">
          <h3 className="font-display text-xl sm:text-2xl font-bold gold-text">
            {active.name}{" "}
            <span className="text-base sm:text-lg text-foreground/70 font-normal">
              {active.heavenlyStem}
              {active.earthlyBranch}
            </span>
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted mb-2 tracking-wider">주성(主星)</p>
              <div className="flex flex-wrap gap-1">
                {active.majorStars.length === 0 && (
                  <span className="text-muted text-sm">공궁(空宮)</span>
                )}
                {active.majorStars.map((s, i) => (
                  <span
                    key={i}
                    className="rounded bg-gold/10 border border-gold/30 px-2 py-1 text-xs gold-text font-medium"
                  >
                    {s.name}
                    {s.brightness ? ` (${s.brightness})` : ""}
                    {s.mutagen ? ` · ${s.mutagen}` : ""}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-2 tracking-wider">잡성·소성</p>
              <div className="flex flex-wrap gap-1">
                {[...active.minorStars, ...active.adjectiveStars].slice(0, 12).map((s, i) => (
                  <span key={i} className="rounded border border-white/15 px-2 py-1 text-xs">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {active.decadal?.range && (
            <p className="mt-4 text-sm text-muted">
              대운: <span className="gold-text">{active.decadal.range[0]} - {active.decadal.range[1]}세</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
