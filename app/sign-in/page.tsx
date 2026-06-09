import Link from "next/link";
import { SignInForm } from "./form";

export const metadata = { title: "로그인" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; mode?: "signup" }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl ?? "/mypage";
  const initialMode = sp.mode === "signup" ? "signup" : "signin";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 safe-top safe-bottom">
      <Link href="/" className="text-center font-display text-3xl font-bold gold-text mb-2">
        紫微
      </Link>
      <p className="text-center text-xs text-muted tracking-[0.3em] mb-8">ZAMIDUSU</p>

      <div className="palace-card rounded-2xl p-6">
        <SignInForm callbackUrl={callbackUrl} initialMode={initialMode} error={sp.error} />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted">
        가입 시 이용약관과 개인정보처리방침에 동의합니다.
      </p>
    </main>
  );
}
