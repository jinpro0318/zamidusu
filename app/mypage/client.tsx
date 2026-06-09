"use client";

import { Mypage, type SavedItem } from "@/components/ziwei/screens/Mypage";
import { useNav } from "@/components/ziwei/use-nav";

export function MypageClient({ email, saved }: { email: string; saved: SavedItem[] }) {
  const nav = useNav();
  return <Mypage nav={nav} saved={saved} email={email} />;
}
