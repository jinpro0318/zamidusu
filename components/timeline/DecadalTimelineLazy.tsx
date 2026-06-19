"use client";

// recharts(약 5MB)는 무겁고 대운 타임라인 라우트에서만 쓰인다.
// next/dynamic + ssr:false로 클라이언트에서 지연 로드해, 이 라우트 진입 전까지
// 공통 초기 번들에 recharts가 포함되지 않도록 분리한다.
import dynamic from "next/dynamic";
import type { DecadalSlice } from "@/lib/iztro/horoscope";

const DecadalTimeline = dynamic(
  () => import("./DecadalTimeline").then((m) => m.DecadalTimeline),
  {
    ssr: false,
    loading: () => <div style={{ height: 280 }} aria-hidden />,
  },
);

export function DecadalTimelineLazy(props: { decadals: DecadalSlice[]; currentAge: number }) {
  return <DecadalTimeline {...props} />;
}
