import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
          모바일 퍼스트 + 데스크탑 폰 목업 프레임.
          - 모바일(<sm): 컨테이너가 화면을 꽉 채움 (w-full h-[100dvh])
          - 데스크탑(sm+): iPhone 14 비율(390x844, 9:19.5) 프레임이 화면 정중앙에 떠 있고
            상단에 iOS 상태바(9:41 + 노치 + 신호/와이파이/배터리), 하단에 홈 인디케이터 표시
          - body의 radial-gradient 배경은 globals.css 에서 처리
        */}
        <div className="relative flex min-h-dvh w-full items-center justify-center sm:p-4">
          <div
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#15102a] transform-gpu
                       sm:h-[844px] sm:w-[390px] sm:max-h-[calc(100dvh-32px)]
                       sm:rounded-[44px] sm:border-[10px] sm:border-[#0a0817]
                       sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            {/* iOS 상태바 — 데스크탑 목업 전용 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[44px] items-center justify-between px-7 text-white sm:flex">
              <span className="text-[15px] font-semibold tracking-tight tabular-nums">9:41</span>
              <span className="absolute left-1/2 top-[8px] h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
              <div className="flex items-center gap-[5px]">
                {/* 신호 */}
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
                  <rect x="0" y="7" width="3" height="4" rx="0.5" />
                  <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                  <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                  <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                </svg>
                {/* Wi-Fi */}
                <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
                  <path d="M7.5 11l1.8-2.2c-1-.7-2.6-.7-3.6 0L7.5 11zM3.7 6.3l1.5 1.8c1.4-1 3.3-1 4.6 0l1.5-1.8c-2.1-1.7-5.5-1.7-7.6 0zM.5 2.4l1.5 1.8c3-2.3 8-2.3 11 0L14.5 2.4c-3.8-3-10.2-3-14 0z" />
                </svg>
                {/* 배터리 */}
                <div className="relative ml-[2px] h-[11px] w-[24px] rounded-[3px] border border-white/45">
                  <div className="absolute inset-[1.5px] rounded-[1.5px] bg-white" />
                  <div className="absolute -right-[2.5px] top-[3px] h-[5px] w-[1.5px] rounded-r-[1px] bg-white/45" />
                </div>
              </div>
            </div>

            {/* 콘텐츠 영역 — 자식들이 minHeight:100% 로 잡히도록 고정 높이 제공 */}
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>

            {/* 홈 인디케이터 — 데스크탑 목업 전용 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-[24px] items-center justify-center sm:flex">
              <div className="h-[5px] w-[134px] rounded-full bg-white/85" />
            </div>
          </div>
        </div>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
