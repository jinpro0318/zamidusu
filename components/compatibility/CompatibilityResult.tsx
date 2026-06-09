import type { CompatibilityScore } from "@/lib/iztro/compatibility";

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
    <div className="space-y-5">
      <div className="palace-card rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-xs sm:text-sm text-muted">
          {nameA} <span className="gold-text mx-1">❤</span> {nameB}
        </p>
        <p className="font-display text-6xl sm:text-7xl font-bold gold-text mt-3 leading-none">
          {score.total}
        </p>
        <p className="text-xs text-muted mt-1">/ 100</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Category label="연애" value={score.love} />
        <Category label="직장" value={score.work} />
        <Category label="가족" value={score.family} />
      </div>

      <div className="palace-card rounded-2xl p-5 sm:p-6">
        <h3 className="font-display text-base sm:text-lg gold-text tracking-wider mb-3">
          상세 분석
        </h3>
        <ul className="space-y-2.5">
          {score.breakdown.map((b, i) => (
            <li key={i} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="text-foreground/90 text-xs sm:text-sm">{b.label}</p>
                {b.detail && (
                  <p className="text-[11px] sm:text-xs text-muted mt-0.5 leading-relaxed">
                    {b.detail}
                  </p>
                )}
              </div>
              <span
                className={
                  "shrink-0 text-sm font-display " +
                  (b.delta > 0 ? "text-emerald-300" : b.delta < 0 ? "text-rose" : "text-muted")
                }
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
    <div className="palace-card rounded-lg p-3 sm:p-4 text-center">
      <p className="text-[10px] sm:text-xs text-muted tracking-wider">{label}</p>
      <p className="font-display text-2xl sm:text-3xl gold-text mt-1">{value}</p>
    </div>
  );
}
