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
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
