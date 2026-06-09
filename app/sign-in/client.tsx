"use client";

import { Login } from "@/components/ziwei/screens/Login";
import { useNav } from "@/components/ziwei/use-nav";

export function SignInClient({ callbackUrl }: { callbackUrl?: string }) {
  const nav = useNav();
  return <Login nav={nav} callbackUrl={callbackUrl} />;
}
