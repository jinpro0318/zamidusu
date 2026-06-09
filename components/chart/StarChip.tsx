import { cn } from "@/lib/utils";
import type { StarLite } from "@/lib/iztro/types";

// 사화 색상 매핑 (CSS 토큰)
const MUTAGEN_CLASS: Record<string, string> = {
  화록: "mut-bg-lu",
  화권: "mut-bg-quan",
  화과: "mut-bg-ke",
  화기: "mut-bg-ji",
};

const MUTAGEN_LABEL: Record<string, string> = {
  화록: "祿",
  화권: "權",
  화과: "科",
  화기: "忌",
};

export function StarChip({
  star,
  size = "md",
  showName = true,
}: {
  star: StarLite;
  size?: "sm" | "md";
  showName?: boolean;
}) {
  const isMajor = star.type === "major" || (star.scope ?? "").includes("origin");
  const mutagenClass = star.mutagen ? MUTAGEN_CLASS[star.mutagen] ?? "" : "";
  const hasMutagen = !!star.mutagen;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1 py-px leading-none",
        size === "sm" ? "text-[9px] sm:text-[10px]" : "text-xs",
        hasMutagen
          ? mutagenClass
          : isMajor
            ? "font-display font-bold text-gold border-gold/30 bg-gold/5"
            : "text-foreground/85 border-white/15",
      )}
      title={`${star.name}${star.brightness ? ` (${star.brightness})` : ""}${star.mutagen ? ` · ${star.mutagen}` : ""}`}
    >
      {showName && <span className={isMajor ? "font-bold" : ""}>{star.name}</span>}
      {star.mutagen && (
        <span className="font-display text-[9px] opacity-90">{MUTAGEN_LABEL[star.mutagen] ?? ""}</span>
      )}
    </span>
  );
}
