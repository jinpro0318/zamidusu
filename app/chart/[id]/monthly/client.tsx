"use client";

import { MonthlyScreen } from "@/components/ziwei/screens/MonthlyScreen";
import { useNav } from "@/components/ziwei/use-nav";

export function MonthlyClient({
  chartId,
  subjectName,
}: {
  chartId: string;
  subjectName?: string;
}) {
  const nav = useNav(chartId);
  return <MonthlyScreen nav={nav} chartId={chartId} subjectName={subjectName} />;
}
