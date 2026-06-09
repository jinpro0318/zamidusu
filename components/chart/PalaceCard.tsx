import { cn } from "@/lib/utils";
import type { PalaceLite } from "@/lib/iztro/types";
import { StarChip } from "./StarChip";

export function PalaceCard({
  palace,
  active = false,
  highlight = false,
  onClick,
}: {
  palace: PalaceLite;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  const isSoul = palace.name.includes("명");
  const isBody = palace.isBodyPalace;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "palace-card relative flex h-full flex-col gap-1 rounded-md p-1.5 sm:p-2.5 text-left transition-all",
        "min-h-[88px] sm:min-h-[140px]",
        active && "ring-2 ring-gold",
        highlight && "border-gold/60",
        isSoul && "bg-gradient-to-br from-gold/12 to-transparent",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-display text-[11px] sm:text-sm font-bold gold-text leading-none">
          {palace.name}
        </span>
        {isBody && (
          <span className="rounded bg-gold/20 px-1 text-[9px] gold-text leading-tight">신</span>
        )}
      </div>
      <span className="text-[9px] sm:text-[10px] text-muted leading-none">
        {palace.heavenlyStem}
        {palace.earthlyBranch}
      </span>

      <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-0.5">
        {palace.majorStars.length === 0 && (
          <span className="text-[9px] sm:text-[10px] text-muted/60">공궁</span>
        )}
        {palace.majorStars.map((s, i) => (
          <StarChip key={`m-${i}`} star={s} size="sm" />
        ))}
      </div>

      {palace.minorStars.length > 0 && (
        <div className="hidden sm:flex flex-wrap gap-0.5 opacity-75">
          {palace.minorStars.slice(0, 4).map((s, i) => (
            <StarChip key={`mi-${i}`} star={s} size="sm" />
          ))}
        </div>
      )}

      {palace.decadal?.range && (
        <div className="mt-auto pt-0.5 text-[9px] sm:text-[10px] text-muted/80">
          {palace.decadal.range[0]}-{palace.decadal.range[1]}
        </div>
      )}
    </button>
  );
}
