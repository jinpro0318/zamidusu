"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2, Copy } from "lucide-react";

declare global {
  interface Window {
    Kakao?: any;
  }
}

export function ShareButton({
  chartId,
  shareToken,
  title,
}: {
  chartId: string;
  shareToken?: string | null;
  title: string;
}) {
  const [token, setToken] = useState<string | null>(shareToken ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!key || typeof window === "undefined") return;
    if (window.Kakao && !window.Kakao.isInitialized?.()) {
      window.Kakao.init(key);
    }
  }, []);

  async function enable() {
    setLoading(true);
    try {
      const res = await fetch(`/api/charts/${chartId}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "공유 토큰 발급 실패");
      setToken(data.shareToken);
      toast.success("공유 링크가 활성화됐어요");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    if (!token) return;
    const url = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("링크 복사 완료");
  }

  function shareKakao() {
    if (!token || !window.Kakao?.Share) {
      toast.error("카카오 SDK가 초기화되지 않았어요");
      return;
    }
    const url = `${window.location.origin}/share/${token}`;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${title} — 자미두수 명반`,
        description: "내 명반과 12궁 풀이를 확인해보세요.",
        imageUrl: `${window.location.origin}/api/og/chart/${token}`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [{ title: "명반 보기", link: { mobileWebUrl: url, webUrl: url } }],
    });
  }

  if (!token) {
    return (
      <Button onClick={enable} disabled={loading} variant="outline">
        <Share2 className="size-4" />
        공유하기
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={copyUrl} variant="outline">
        <Copy className="size-4" />
        링크 복사
      </Button>
      <Button onClick={shareKakao} variant="default">
        카카오톡 공유
      </Button>
    </div>
  );
}
