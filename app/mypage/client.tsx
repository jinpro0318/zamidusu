"use client";

import { Mypage, type SavedItem } from "@/components/ziwei/screens/Mypage";
import { useNav } from "@/components/ziwei/use-nav";
import { signOutAction } from "./actions";

export function MypageClient({
  email,
  nickname,
  plan,
  joinedAt,
  chartCount,
  compatCount,
  saved,
}: {
  email: string;
  nickname: string;
  plan: "FREE" | "PREMIUM" | "PRO";
  joinedAt: string;
  chartCount: number;
  compatCount: number;
  saved: SavedItem[];
}) {
  const nav = useNav();
  return (
    <Mypage
      nav={nav}
      saved={saved}
      email={email}
      nickname={nickname}
      plan={plan}
      joinedAt={joinedAt}
      chartCount={chartCount}
      compatCount={compatCount}
      onSignOut={signOutAction}
    />
  );
}
