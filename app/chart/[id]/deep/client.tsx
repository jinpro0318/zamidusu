"use client";

import { DeepReadingScreen } from "@/components/ziwei/screens/DeepReadingScreen";
import { useNav } from "@/components/ziwei/use-nav";

export function DeepReadingClient({
  chartId,
  subjectName,
  timeUncertain,
}: {
  chartId: string;
  subjectName?: string;
  timeUncertain?: boolean;
}) {
  const nav = useNav(chartId);
  return <DeepReadingScreen nav={nav} chartId={chartId} subjectName={subjectName} timeUncertain={timeUncertain} />;
}
