"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export function SignInForm({
  callbackUrl,
  initialMode,
  error,
}: {
  callbackUrl: string;
  initialMode: Mode;
  error?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState<"" | "kakao" | "email">("");

  async function onKakao() {
    setLoading("kakao");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(callbackUrl)}`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      toast.error(e.message ?? "카카오 로그인 실패");
      setLoading("");
    }
  }

  async function onEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("email");
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(callbackUrl)}`,
          },
        });
        if (error) throw error;
        toast.success("확인 이메일을 보냈어요. 메일함을 확인해주세요.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(translate(err.message ?? "로그인 실패"));
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold text-center">
        {mode === "signup" ? "회원가입" : "로그인"}
      </h1>

      {error && (
        <div className="rounded-md bg-rose/10 border border-rose/30 p-3 text-xs text-rose">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={onKakao}
        disabled={loading !== ""}
        className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
        size="lg"
      >
        {loading === "kakao" ? "이동 중…" : "카카오로 계속하기"}
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted">
        <div className="h-px flex-1 bg-white/10" />
        또는 이메일
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onEmail} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs gold-text tracking-wider">
            이메일
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs gold-text tracking-wider">
            비밀번호
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="최소 6자"
          />
        </div>
        <Button type="submit" variant="outline" className="w-full" size="lg" disabled={loading !== ""}>
          {loading === "email"
            ? "처리 중…"
            : mode === "signup"
              ? "가입하기"
              : "로그인"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted">
        {mode === "signup" ? (
          <>
            이미 계정이 있으세요?{" "}
            <button type="button" onClick={() => setMode("signin")} className="gold-text underline">
              로그인
            </button>
          </>
        ) : (
          <>
            처음 오셨나요?{" "}
            <button type="button" onClick={() => setMode("signup")} className="gold-text underline">
              회원가입
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function translate(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (/User already registered/i.test(msg)) return "이미 가입된 이메일이에요.";
  if (/Password should be at least/i.test(msg)) return "비밀번호는 최소 6자 이상이어야 해요.";
  return msg;
}
