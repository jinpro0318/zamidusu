"use client";

import { Result } from "@/components/ziwei/screens/Result";
import { useNav } from "@/components/ziwei/use-nav";
import type { Area } from "@/lib/ziwei-types";
import type { BankInfo } from "@/components/ziwei/sheets/DepositSheet";

export function ResultClient({
  areas,
  subjectName,
  birthLabel,
  chartId,
  loggedIn,
  isPaid,
  bank,
}: {
  areas: Area[];
  subjectName?: string;
  birthLabel: string;
  chartId: string;
  loggedIn: boolean;
  isPaid?: boolean;
  bank?: BankInfo;
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
      bank={bank}
      chartId={chartId}
    />
  );
}
