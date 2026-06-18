"use client";

import { Detail } from "@/components/ziwei/screens/Detail";
import { useNav } from "@/components/ziwei/use-nav";
import type { Area } from "@/lib/ziwei-types";

export function DetailClient({
  areas,
  palaceKey,
  chartId,
  loggedIn,
  timeUncertain,
}: {
  areas: Area[];
  palaceKey: string;
  chartId: string;
  loggedIn: boolean;
  timeUncertain?: boolean;
}) {
  const nav = useNav(chartId);
  return (
    <Detail
      nav={nav}
      areas={areas}
      params={{ key: palaceKey }}
      loggedIn={loggedIn}
      chartId={chartId}
      timeUncertain={timeUncertain}
    />
  );
}
