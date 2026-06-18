import Link from "next/link";
import { Z, SERIF, SANS } from "@/theme/tokens";

export const metadata = { title: "테스트 중" };

// 입금/결제 테스트 단계 안내 페이지. 실제 결제 처리 없이 이 화면으로 안내한다.
export default function PendingPage() {
  return (
    <main
      style={{
        minHeight: "100%",
        background: Z.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 26px calc(40px + env(safe-area-inset-bottom))",
      }}
    >
      <div style={{ fontSize: 48 }} aria-hidden>🛠️</div>
      <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: Z.ink, margin: "16px 0 0" }}>
        현재는 테스트 중입니다
      </h1>
      <p style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2, lineHeight: 1.7, margin: "12px 0 0", maxWidth: 320 }}>
        아직 정식 결제 전이라, 입금/잠금해제는 동작하지 않아요.
        <br />
        준비가 끝나 정식 오픈하면 가장 먼저 알려드릴게요.
        <br />
        관심 가져주셔서 고맙습니다. 🙏
      </p>

      <Link
        href="/mypage"
        style={{
          marginTop: 24,
          textDecoration: "none",
          background: `linear-gradient(180deg,${Z.p600},${Z.p700})`,
          color: "#fff",
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 700,
          borderRadius: 14,
          padding: "13px 26px",
        }}
      >
        마이페이지로
      </Link>
      <Link
        href="/"
        style={{ marginTop: 14, textDecoration: "none", fontFamily: SANS, fontSize: 13.5, color: Z.ink3 }}
      >
        홈으로
      </Link>
    </main>
  );
}
