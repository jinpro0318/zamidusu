"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Z, SANS, SERIF } from "@/theme/tokens";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    // redirect가 일어나므로 loading 해제 불필요
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: Z.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      {/* 로고 영역 */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: 22,
            background: `linear-gradient(160deg, ${Z.p800} 0%, ${Z.p600} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 28px rgba(94,71,160,0.35)",
          }}
        >
          <span style={{ fontFamily: SERIF, fontSize: 32, color: "#fff" }}>紫</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 800, color: Z.ink, margin: "0 0 6px" }}>
          자미두수
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: Z.ink3, margin: 0 }}>
          나만의 명반으로 인생을 읽어요
        </p>
      </div>

      {/* 로그인 카드 */}
      <div
        style={{
          width: "100%", maxWidth: 360,
          background: Z.white,
          borderRadius: 22,
          padding: "28px 24px",
          boxShadow: "0 4px 24px rgba(36,26,61,0.10)",
        }}
      >
        <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: Z.ink, textAlign: "center", margin: "0 0 20px" }}>
          간편 로그인
        </p>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          disabled={loading}
          style={{
            width: "100%", cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: (Z as any).kakao ?? "#FEE500",
            border: "none", borderRadius: 14,
            padding: "14px 16px",
            fontFamily: SANS, fontSize: 15, fontWeight: 700, color: "#3C1E1E",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* 카카오 말풍선 아이콘 */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 2C5.582 2 2 4.925 2 8.5c0 2.26 1.443 4.248 3.617 5.415L4.75 17.5l4.16-2.76c.36.05.725.076 1.09.076 4.418 0 8-2.925 8-6.5S14.418 2 10 2z"
              fill="#3C1E1E"
            />
          </svg>
          {loading ? "연결 중…" : "카카오로 시작하기"}
        </button>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: Z.line }} />
          <span style={{ fontFamily: SANS, fontSize: 12, color: Z.ink3 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: Z.line }} />
        </div>

        {/* 게스트로 계속 */}
        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%", cursor: "pointer",
            background: "transparent",
            border: `1.5px solid ${Z.line}`,
            borderRadius: 14, padding: "13px 16px",
            fontFamily: SANS, fontSize: 14, fontWeight: 600, color: Z.ink2,
          }}
        >
          로그인 없이 계속하기
        </button>

        <p style={{ fontFamily: SANS, fontSize: 11.5, color: Z.ink3, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
          로그인 시{" "}
          <a href="/info/terms" style={{ color: Z.p600, textDecoration: "none" }}>이용약관</a>
          {" "}및{" "}
          <a href="/info/privacy" style={{ color: Z.p600, textDecoration: "none" }}>개인정보 처리방침</a>
          에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </main>
  );
}
