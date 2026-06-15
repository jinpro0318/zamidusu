"use client";

import { Onboarding } from "@/components/ziwei/screens/Onboarding";
import { useNav } from "@/components/ziwei/use-nav";

export function HomeClient({ account }: { account: { nickname: string } | null }) {
  const nav = useNav();
  return <Onboarding nav={nav} account={account} />;
}
