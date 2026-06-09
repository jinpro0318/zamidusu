"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { DecadalSlice } from "@/lib/iztro/horoscope";

export function DecadalTimeline({
  decadals,
  currentAge,
}: {
  decadals: DecadalSlice[];
  currentAge: number;
}) {
  const data = useMemo(
    () =>
      decadals.map((d) => ({
        range: `${d.startAge}-${d.endAge}`,
        startAge: d.startAge,
        score: d.score,
        palace: d.palaceName,
        stars: d.majorStars.join(", "),
      })),
    [decadals],
  );

  const [selected, setSelected] = useState<DecadalSlice | null>(null);

  const currentRange = decadals.find((d) => currentAge >= d.startAge && currentAge <= d.endAge);

  return (
    <div className="space-y-4">
      <div className="palace-card rounded-lg p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="range" stroke="#a89dba" tick={{ fontSize: 11 }} />
            <YAxis stroke="#a89dba" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="palace-card rounded-md p-3 text-xs">
                    <p className="font-display gold-text">{d.range}세</p>
                    <p className="text-foreground">{d.palace}궁 · {d.stars || "공궁"}</p>
                    <p className="text-muted">점수 {d.score}</p>
                  </div>
                );
              }}
            />
            {currentRange && (
              <ReferenceLine
                x={`${currentRange.startAge}-${currentRange.endAge}`}
                stroke="#e3c36b"
                strokeDasharray="3 3"
                label={{ value: "현재", fill: "#e3c36b", fontSize: 11 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#e3c36b"
              strokeWidth={3}
              dot={{ r: 5, fill: "#e3c36b" }}
              activeDot={{
                r: 8,
                onClick: (_, payload: any) => {
                  const idx = decadals.findIndex((d) => d.startAge === payload.payload.startAge);
                  if (idx >= 0) setSelected(decadals[idx]);
                },
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {selected && (
        <div className="palace-card rounded-lg p-6">
          <h3 className="font-display text-xl gold-text">
            {selected.startAge} - {selected.endAge}세 · {selected.palaceName}궁
          </h3>
          <p className="mt-2 text-sm text-muted">
            대운 천간지지: {selected.heavenlyStem ?? "-"}
            {selected.earthlyBranch ?? "-"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.majorStars.length === 0 && <span className="text-muted text-sm">공궁(空宮)</span>}
            {selected.majorStars.map((s, i) => (
              <span key={i} className="rounded bg-gold/10 border border-gold/30 px-2 py-1 text-xs gold-text">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">점수 {selected.score}/100</p>
        </div>
      )}
    </div>
  );
}
