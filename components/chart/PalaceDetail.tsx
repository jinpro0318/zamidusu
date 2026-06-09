import type { PalaceLite } from "@/lib/iztro/types";
import { metaFor } from "@/lib/iztro/palace-meta";

const MUTAGEN: Record<string, { key: string; cls: string }> = {
  화록: { key: "祿", cls: "mut-lu" },
  화권: { key: "權", cls: "mut-quan" },
  화과: { key: "科", cls: "mut-ke" },
  화기: { key: "忌", cls: "mut-ji" },
};

export function PalaceDetail({ palace }: { palace: PalaceLite }) {
  const meta = metaFor(palace.name);

  return (
    <article className="palace-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-2xl shrink-0">
            {meta.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl sm:text-2xl font-bold gold-text leading-tight">
              {meta.shortName}
            </h3>
            <p className="text-[11px] text-muted">{meta.longName} · {meta.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted tracking-wider">干支</p>
          <p className="font-display text-base sm:text-lg gold-text">
            {palace.heavenlyStem}
            {palace.earthlyBranch}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Section title="주성 · 主星">
          {palace.majorStars.length === 0 ? (
            <span className="text-sm text-muted italic">공궁(空宮)</span>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {palace.majorStars.map((s, i) => (
                <div
                  key={i}
                  className="palace-card rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="font-display gold-text font-bold">{s.name}</p>
                    {s.brightness && (
                      <p className="text-[10px] text-muted tracking-wider">{s.brightness}</p>
                    )}
                  </div>
                  {s.mutagen && MUTAGEN[s.mutagen] && (
                    <span
                      className={`font-display text-xl ${MUTAGEN[s.mutagen].cls}`}
                      title={s.mutagen}
                    >
                      {MUTAGEN[s.mutagen].key}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {palace.minorStars.length > 0 && (
          <Section title="잡성 · 雜星">
            <div className="flex flex-wrap gap-1.5">
              {palace.minorStars.map((s, i) => (
                <span
                  key={i}
                  className="rounded border border-white/15 px-2 py-0.5 text-xs text-foreground/80"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {palace.adjectiveStars.length > 0 && (
          <Section title="소성 · 小星">
            <div className="flex flex-wrap gap-1.5">
              {palace.adjectiveStars.slice(0, 16).map((s, i) => (
                <span
                  key={i}
                  className="rounded border border-white/10 px-2 py-0.5 text-[11px] text-muted"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {palace.decadal?.range && (
          <div className="flex items-center justify-between rounded-md bg-gold/5 border border-gold/15 px-3 py-2 text-sm">
            <span className="text-muted">대운 구간</span>
            <span className="font-display gold-text">
              {palace.decadal.range[0]} – {palace.decadal.range[1]}세
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] gold-text tracking-[0.2em] mb-2">{title}</p>
      {children}
    </div>
  );
}
