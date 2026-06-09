"use client";

import { Onboarding } from "@/components/ziwei/screens/Onboarding";
import { useNav } from "@/components/ziwei/use-nav";

export default function Home() {
  const nav = useNav();
  return <Onboarding nav={nav} />;
}
