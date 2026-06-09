import { cn } from "@/lib/utils";
import type { PalaceLite } from "@/lib/iztro/types";
import { StarChip } from "./StarChip";
import { metaFor } from "@/lib/iztro/palace-meta";

export function PalaceCard({
  palace,
  active = false,
  onClick,
}: {
  palace: PalaceLite;
  active?: boolean;
  onClick?: () => void;
}) {
  const meta = metaFor(palace.name);
  const isSoul = palace.name.includes("명");
  const isBody = palace.isBodyPalace;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "palace-card relative flex h-full flex-col gap-1 rounded-md p-1.5 sm:p-2.5 text-left transition-all",
        "min-h-[96px] sm:min-h-[140px]",
        "hover:-translate-y-0.5 active:scale-[0.98]",
        active && "ring-2 ring-gold scale-[1.02]",
        isSoul && "palace-card-soul",
        isBody && !isSoul && "palace-card-body",
      )}
    >
      {/* 헤더: 아이콘 + 궁명 + 간지 */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[12px] sm:text-sm leading-none shrink-0" aria-hidden>
            {meta.emoji}
          </span>
          <span className="font-display text-[11px] sm:text-sm font-bold gold-text leading-none truncate">
            {meta.shortName}
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-muted leading-none font-display shrink-0">
          {palace.heavenlyStem}
          {palace.earthlyBranch}
        </span>
      </div>

      {/* 신궁/명궁 뱃지 */}
      {(isSoul || isBody) && (
        <div className="flex gap-1">
          {isSoul && (
            <span className="rounded bg-gold/30 text-purple-deep px-1 text-[8px] sm:text-[9px] font-bold leading-tight">
              命
            </span>
          )}
          {isBody && (
            <span className="rounded bg-lavender/20 text-lavender px-1 text-[8px] sm:text-[9px] font-bold leading-tight">
              身
            </span>
          )}
        </div>
      )}

      {/* 주성 */}
      <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-0.5 min-h-[14px]">
        {palace.majorStars.length === 0 ? (
          <span className="text-[9px] sm:text-[10px] text-muted/50 italic">공궁</span>
        ) : (
          palace.majorStars.slice(0, 3).map((s, i) => <StarChip key={`m-${i}`} star={s} size="sm" />)
        )}
      </div>

      {/* 데스크탑 잡성 */}
      {palace.minorStars.length > 0 && (
        <div className="hidden sm:flex flex-wrap gap-0.5 opacity-75">
          {palace.minorStars.slice(0, 4).map((s, i) => (
            <StarChip key={`mi-${i}`} star={s} size="sm" />
          ))}
        </div>
      )}

      {/* 대운 구간 */}
      {palace.decadal?.range && (
        <div className="mt-auto pt-0.5 text-[9px] sm:text-[10px] text-muted/80 font-display">
          {palace.decadal.range[0]}–{palace.decadal.range[1]}세
        </div>
      )}
    </button>
  );
}
