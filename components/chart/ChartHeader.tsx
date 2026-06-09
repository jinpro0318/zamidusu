import type { AstrolabePayload } from "@/lib/iztro/types";
import { Badge } from "@/components/ui/badge";

export function ChartHeader({
  payload,
  subjectName,
  gender,
}: {
  payload: AstrolabePayload;
  subjectName?: string | null;
  gender: string;
}) {
  return (
    <header className="space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge>{gender === "MALE" ? "남" : "여"}</Badge>
        {payload.zodiac && <Badge variant="outline">{payload.zodiac}</Badge>}
      </div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
        {subjectName ?? "나의 명반"}
      </h1>
      <p className="text-xs sm:text-sm text-muted leading-relaxed">
        양력 {payload.solarDate}
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> · </span>
        음력 {payload.lunarDate}
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> · </span>
        {payload.time} ({payload.timeRange})
      </p>
    </header>
  );
}
