"use client";

import { Chart } from "@/components/ziwei/screens/Chart";
import { useNav } from "@/components/ziwei/use-nav";
import type { Area } from "@/lib/ziwei-types";

export function PlateClient({
  areas,
  birthLabel,
  chartId,
}: {
  areas: Area[];
  birthLabel: string;
  chartId: string;
}) {
  const nav = useNav(chartId);
  return <Chart nav={nav} areas={areas} birthLabel={birthLabel} />;
}
