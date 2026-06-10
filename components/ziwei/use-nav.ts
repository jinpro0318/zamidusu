'use client';

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { Nav, NavParams, ScreenKey, GateReason } from "@/lib/ziwei-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// ziwei-app screen key → Next.js route 매핑.
// `chartId`는 NavParams로 받아 동적 경로에 끼움.
// chartId가 없는데 chart 컨텍스트 화면으로 가려고 하면 "/"로 폴백 + 경고 (이전에는
// "current"라는 가짜 id로 404를 유발했음).
function routeFor(s: ScreenKey, params?: NavParams): string {
  const chartId = params?.chartId as string | undefined;
  switch (s) {
    case "onboarding": return "/";
    case "login":      return "/sign-in";
    case "input":      return "/chart/new";
    case "mypage":     return "/mypage";
    case "result":
    case "detail": {
      if (!chartId) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[useNav] '${s}' navigation requires chartId — falling back to '/'`);
        }
        return "/";
      }
      if (s === "result") return `/chart/${chartId}`;
      return `/chart/${chartId}/palace/${encodeURIComponent((params?.key as string) ?? "命宮")}`;
    }
  }
}

export function useNav(currentChartId?: string): Nav {
  const router = useRouter();

  const requireLogin = useCallback(
    async (reason: GateReason, cb?: () => void) => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          cb?.();
          return;
        }
      } catch {
        /* supabase 미설정 시 환경에서는 그냥 로그인 페이지로 */
      }
      router.push(`/sign-in?reason=${reason}`);
    },
    [router],
  );

  return useMemo<Nav>(
    () => ({
      go: (s, params) => router.push(routeFor(s, { chartId: currentChartId, ...params })),
      back: () => router.back(),
      tab: (s) => router.push(routeFor(s, { chartId: currentChartId })),
      reset: (s) => router.replace(routeFor(s, { chartId: currentChartId })),
      requireLogin,
      hrefFor: (s, params) => routeFor(s, { chartId: currentChartId, ...params }),
    }),
    [router, requireLogin, currentChartId],
  );
}
