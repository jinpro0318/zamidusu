import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SupportWidget } from "@/components/support/SupportWidget";
import { FrameBackground } from "@/components/layout/FrameBackground";

const myeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-myeongjo",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#15102a",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "자미두수 · 무료 명반 · AI 해석 | zamidusu",
    template: "%s | zamidusu",
  },
  description:
    "1초 만에 만드는 자미두수 명반. 12궁·14주성 자동 분석, AI 챗봇 해석, 무료 궁합. 양력/음력 모두 지원.",
  keywords: ["자미두수", "자미두수 명반", "자미두수 무료", "자미두수 궁합", "자미두수 보는법", "사주", "운세"],
  openGraph: {
    type: "website",
    siteName: "zamidusu",
    locale: "ko_KR",
    title: "자미두수 · 무료 명반 · AI 해석",
    description: "12궁·14주성 자동 분석, AI 챗봇 해석, 무료 궁합.",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={myeongjo.variable}>
      <body className="antialiased">
        {/*
          반응형 풀-블리드 레이아웃 (폰 목업 프레임 제거).
          - 모바일: 화면을 꽉 채움 (w-full h-dvh)
          - 데스크탑: 중앙 정렬 컬럼이 480px 고정 폭으로 가운데 정렬
          - body의 radial-gradient 배경은 globals.css 에서 처리
        */}
        <FrameBackground />
        <div className="relative z-10 flex min-h-dvh w-full justify-center">
          <div
            // transform: translateZ(0)으로 이 컬럼을 CSS containing block으로 만든다.
            // 결과: 자식 트리의 position:fixed 시트(PickerSheet/ShareSheet/QASheet/LoginGate)와
            // 하단 고정 입력창이 뷰포트가 아닌 이 컬럼 폭에 attach → 데스크탑에서 콘텐츠 폭을 벗어나지 않음.
            // 모든 기기에서 동일한 480px 앱 컬럼으로 통일 (폰=꽉 채움, 태블릿/PC=가운데 정렬+양옆 여백).
            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            className="relative flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-[#15102a]"
          >
            {/* 콘텐츠 영역 — 자식들이 minHeight:100% 로 잡히도록 고정 높이 제공.
                data-scroll-root: 형제로 렌더되는 SupportWidget이 이 스크롤 컨테이너를 찾아
                scroll 리스너를 붙이기 위한 식별자. */}
            <div
              data-scroll-root
              className="no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden"
            >
              {children}
            </div>
            {/* 고객센터 플로팅 버튼 — 모바일 프레임 컬럼에 attach (position:fixed가 이 컬럼 기준) */}
            <SupportWidget />
          </div>
        </div>
        <Toaster theme="dark" position="top-center" />
        {/*
          Kakao JS SDK — 카카오톡 공유(Kakao.Share.sendDefault)에 사용.
          init은 NEXT_PUBLIC_KAKAO_JS_KEY가 있을 때만 lib/share/kakao.ts에서 수행.
          src/integrity는 카카오 공식 CDN 2.7.5 파일 기준 SRI(직접 산출).
        */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js"
          integrity="sha384-dok87au0gKqJdxs7msEdBPNnKSRT+/mhTVzq+qOhcL464zXwvcrpjeWvyj1kCdq6"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
