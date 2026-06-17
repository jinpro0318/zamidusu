import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { InputClient } from "./client";

export const metadata = { title: "명반 만들기" };

export default async function NewChartPage() {
  // 로그인 여부만 서버에서 판별(기존 Supabase 세션 기반 auth() 재사용).
  // 회원이면 입력 화면에 "내 명반 불러오기"가 노출되고, 비회원은 기존 화면 그대로.
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return (
    <Suspense>
      <InputClient isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
