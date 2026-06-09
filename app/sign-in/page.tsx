import { Suspense } from "react";
import { SignInClient } from "./client";

export const metadata = { title: "로그인" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Suspense>
      <SignInClient callbackUrl={sp.callbackUrl} />
    </Suspense>
  );
}
