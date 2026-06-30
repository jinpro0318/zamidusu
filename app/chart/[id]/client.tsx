"use client";

import { Result } from "@/components/ziwei/screens/Result";
import { useNav } from "@/components/ziwei/use-nav";
import type { Area } from "@/lib/ziwei-types";

export function ResultClient({
  areas,
  subjectName,
  birthLabel,
  chartId,
  loggedIn,
  isPaid,
  timeUncertain,
}: {
  areas: Area[];
  subjectName?: string;
  birthLabel: string;
  chartId: string;
  loggedIn: boolean;
  isPaid?: boolean;
  timeUncertain?: boolean;
}) {
  const nav = useNav(chartId);
  return (
    <Result
      nav={nav}
      areas={areas}
      subjectName={subjectName}
      birthLabel={birthLabel}
      loggedIn={loggedIn}
      isPaid={isPaid}
      timeUncertain={timeUncertain}
      chartId={chartId}
    />
  );
}
