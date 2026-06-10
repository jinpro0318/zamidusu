"use client";

import { Result } from "@/components/ziwei/screens/Result";
import { useNav } from "@/components/ziwei/use-nav";
import type { Area } from "@/lib/ziwei-types";

export function ResultClient({
  areas,
  subjectName,
  birthLabel,
  chartId,
}: {
  areas: Area[];
  subjectName?: string;
  birthLabel: string;
  chartId: string;
}) {
  const nav = useNav(chartId);
  return <Result nav={nav} areas={areas} subjectName={subjectName} birthLabel={birthLabel} />;
}
