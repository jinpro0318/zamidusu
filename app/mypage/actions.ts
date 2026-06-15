"use server";

import { signOut } from "@/lib/auth";

// 명시적 로그아웃만 세션을 종료. (자동로그인은 미들웨어가 유지)
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
