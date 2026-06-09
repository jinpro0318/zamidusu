"use client";

import { useState } from "react";
import type { AstrolabePayload, PalaceLite } from "@/lib/iztro/types";
import { PalaceCard } from "./PalaceCard";
import { PalaceDetail } from "./PalaceDetail";

// 4×4 그리드. 중앙 2×2는 천반(天盤) 요약.
//   [巳] [午] [未] [申]
//   [辰] [   天盤    ] [酉]
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
    <section className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs gold-text tracking-wider">
          <span className="size-1.5 rounded-full bg-gold inline-block" />
          十二宮 · TWELVE PALACES
        </div>
        <p className="text-[10px] text-muted">탭하면 펼쳐져요</p>
      </div>

      <div className="grid grid-cols-4 gap-1 sm:gap-2.5">
        {GRID_LAYOUT.map((branch, gridIdx) => {
          if (branch === null) {
            if (gridIdx === 5) {
              return <CenterPlate key={gridIdx} payload={payload} />;
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

      {active && <PalaceDetail palace={active} />}
    </section>
  );
}

function CenterPlate({ payload }: { payload: AstrolabePayload }) {
  return (
    <div className="col-span-2 row-span-2 palace-card flex flex-col items-center justify-center rounded-md sm:rounded-lg p-3 sm:p-5 text-center">
      <p className="font-display gold-text text-base sm:text-lg tracking-wider">天盤</p>
      <p className="text-[10px] text-muted/80 mt-0.5">기본 정보</p>

      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-left">
        <span className="text-[10px] text-muted">命主</span>
        <span className="font-display text-xs gold-text">{payload.soul}</span>
        <span className="text-[10px] text-muted">身主</span>
        <span className="font-display text-xs gold-text">{payload.body}</span>
        <span className="text-[10px] text-muted">五行局</span>
        <span className="font-display text-xs gold-text">{payload.fiveElementsClass}</span>
      </div>

      <div className="mt-3 text-[9px] sm:text-[10px] text-muted/70 leading-tight">
        {payload.solarDate}
        <br />
        {payload.time}
      </div>
    </div>
  );
}
