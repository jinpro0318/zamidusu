import { Suspense } from "react";
import { SignInClient } from "./client";

export const metadata = { title: "로그인" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  // ?next= 우선, 구버전 ?callbackUrl= 도 호환
  return (
    <Suspense>
      <SignInClient callbackUrl={sp.next ?? sp.callbackUrl} />
    </Suspense>
  );
}
