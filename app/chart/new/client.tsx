"use client";

import { Input } from "@/components/ziwei/screens/Input";
import { useNav } from "@/components/ziwei/use-nav";

export function InputClient() {
  const nav = useNav();
  return <Input nav={nav} />;
}
