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
import { Z, SANS, SERIF } from "@/theme/tokens";

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
      <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(36,26,61,0.04)" }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke="rgba(36,26,61,0.07)" vertical={false} />
            <XAxis dataKey="range" stroke={Z.ink3} tick={{ fontSize: 11, fill: Z.ink2 }} />
            <YAxis stroke={Z.ink3} tick={{ fontSize: 11, fill: Z.ink2 }} domain={[0, 100]} />
            <Tooltip
              cursor={{ stroke: Z.p100 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 10, padding: 12, boxShadow: "0 6px 18px rgba(36,26,61,0.12)" }}>
                    <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: Z.p600 }}>{d.range}세</p>
                    <p style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink }}>{d.palace}궁 · {d.stars || "공궁"}</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: Z.ink2 }}>점수 {d.score}</p>
                  </div>
                );
              }}
            />
            {currentRange && (
              <ReferenceLine
                x={`${currentRange.startAge}-${currentRange.endAge}`}
                stroke={Z.gold}
                strokeDasharray="3 3"
                label={{ value: "현재", fill: Z.gold, fontSize: 11 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke={Z.p500}
              strokeWidth={3}
              dot={{ r: 5, fill: Z.p500 }}
              activeDot={{
                r: 8,
                fill: Z.p600,
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
        <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 800, color: Z.p600 }}>
            {selected.startAge} - {selected.endAge}세 · {selected.palaceName}궁
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, marginTop: 8 }}>
            대운 천간지지: {selected.heavenlyStem ?? "-"}
            {selected.earthlyBranch ?? "-"}
          </p>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selected.majorStars.length === 0 && <span style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2 }}>공궁(空宮)</span>}
            {selected.majorStars.map((s, i) => (
              <span
                key={i}
                style={{ fontFamily: SERIF, fontSize: 12.5, color: "#9C7C1E", background: "rgba(199,162,63,0.13)", border: "1px solid rgba(199,162,63,0.4)", borderRadius: 8, padding: "3px 9px" }}
              >
                {s}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, marginTop: 12 }}>점수 {selected.score}/100</p>
        </div>
      )}
    </div>
  );
}
