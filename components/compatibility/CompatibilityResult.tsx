import type { CompatibilityScore } from "@/lib/iztro/compatibility";
import { Z, SERIF, SANS } from "@/theme/tokens";

export function CompatibilityResult({
  score,
  nameA,
  nameB,
}: {
  score: CompatibilityScore;
  nameA: string;
  nameB: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 총점 */}
      <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 20, padding: "24px 18px", textAlign: "center", boxShadow: "0 2px 10px rgba(36,26,61,0.05)" }}>
        <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2 }}>
          {nameA} <span style={{ color: "#C0463F", margin: "0 4px" }}>❤</span> {nameB}
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 800, color: Z.p600, margin: "6px 0 0", lineHeight: 1 }}>{score.total}</p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: Z.ink3, marginTop: 2 }}>/ 100</p>
      </div>

      {/* 카테고리 3분할 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Category label="연애" value={score.love} />
        <Category label="직장" value={score.work} />
        <Category label="가족" value={score.family} />
      </div>

      {/* 상세 분석 */}
      <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: "16px 16px" }}>
        <h3 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: Z.p600, margin: "0 0 10px" }}>상세 분석</h3>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {score.breakdown.map((b, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink, margin: 0 }}>{b.label}</p>
                {b.detail && (
                  <p style={{ fontFamily: SANS, fontSize: 12, color: Z.ink2, margin: "2px 0 0", lineHeight: 1.55 }}>{b.detail}</p>
                )}
              </div>
              <span
                style={{
                  flexShrink: 0, fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                  color: b.delta > 0 ? "#1E8E6B" : b.delta < 0 ? "#C0463F" : Z.ink3,
                }}
              >
                {b.delta > 0 ? "+" : ""}
                {b.delta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Category({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
      <p style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink2, margin: 0 }}>{label}</p>
      <p style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800, color: Z.p600, margin: "2px 0 0" }}>{value}</p>
    </div>
  );
}
