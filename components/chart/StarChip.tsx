import { cn } from "@/lib/utils";
import type { StarLite } from "@/lib/iztro/types";

const MUTAGEN_COLOR: Record<string, string> = {
  화록: "text-emerald-300 bg-emerald-300/10 border-emerald-300/30",
  화권: "text-sky-300 bg-sky-300/10 border-sky-300/30",
  화과: "text-violet-300 bg-violet-300/10 border-violet-300/30",
  화기: "text-rose bg-rose/10 border-rose/30",
};

export function StarChip({ star, size = "md" }: { star: StarLite; size?: "sm" | "md" }) {
  const isMajor = star.type === "major" || (star.scope ?? "").includes("origin");
  const mutagenClass = star.mutagen ? MUTAGEN_COLOR[star.mutagen] ?? "" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1 py-px leading-none",
        size === "sm" ? "text-[9px] sm:text-[10px]" : "text-xs",
        isMajor
          ? "font-display font-bold text-gold border-gold/30"
          : "text-foreground/85 border-white/15",
        mutagenClass,
      )}
      title={`${star.name}${star.brightness ? ` (${star.brightness})` : ""}${star.mutagen ? ` ${star.mutagen}` : ""}`}
    >
      {star.name}
      {star.mutagen && <span className="opacity-80">·{star.mutagen.slice(1)}</span>}
    </span>
  );
}
