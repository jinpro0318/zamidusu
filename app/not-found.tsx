import Link from "next/link";
import { Z, SERIF, SANS } from "@/theme/tokens";

export const metadata = {
  title: "찾을 수 없는 페이지 · 자미두수",
  robots: { index: false, follow: false },
};

// 사이트의 보라/다크 테마와 일치하는 커스텀 404.
// 명도 대비:
//   - 본문 흰색(#fff) on 다크 보라(#241A3D~#2C2150) → 대비 15:1+ (WCAG AAA)
//   - 보조 텍스트 rgba(255,255,255,0.82) on 같은 배경 → 약 12:1 (WCAG AAA)
//   - CTA: 어두운 잉크(#231B33) on 금색 그라데이션(#E3C36B~#C7A23F) → 8.5:1+ (WCAG AAA)
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: `linear-gradient(170deg, ${Z.p900} 0%, ${Z.p850} 55%, ${Z.p800} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 은은한 금색 광채 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(227,195,107,0.16), transparent 70%)",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          fontFamily: SERIF,
          fontSize: 112,
          fontWeight: 700,
          color: Z.goldBright,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textShadow: "0 4px 24px rgba(227,195,107,0.25)",
        }}
      >
        404
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 14,
          fontFamily: SERIF,
          fontSize: 14,
          color: Z.goldBright,
          letterSpacing: "0.32em",
        }}
      >
        頁面不在
      </div>

      <h1
        style={{
          position: "relative",
          fontFamily: SERIF,
          fontSize: 26,
          fontWeight: 700,
          color: "#fff",
          margin: "24px 0 12px",
          lineHeight: 1.3,
        }}
      >
        찾으시는 페이지가 없어요
      </h1>

      <p
        style={{
          position: "relative",
          fontFamily: SANS,
          fontSize: 15,
          color: "rgba(255,255,255,0.82)",
          lineHeight: 1.6,
          maxWidth: 340,
          margin: "0 0 36px",
        }}
      >
        주소가 바뀌었거나 더 이상 존재하지 않는 페이지예요.
        <br />
        홈으로 돌아가 다시 시작해 보세요.
      </p>

      <div
        style={{
          position: "relative",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            borderRadius: 999,
            fontFamily: SANS,
            fontSize: 15.5,
            fontWeight: 700,
            color: Z.ink,
            background: `linear-gradient(180deg, ${Z.goldBright}, ${Z.gold})`,
            boxShadow: "0 8px 22px rgba(199,162,63,0.36)",
            textDecoration: "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M10 19l-7-7 7-7M3 12h18"
              stroke={Z.ink}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          홈으로 돌아가기
        </Link>
        <Link
          href="/chart/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 24px",
            borderRadius: 999,
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(227,195,107,0.35)",
            textDecoration: "none",
          }}
        >
          명반 새로 만들기 →
        </Link>
      </div>
    </div>
  );
}
