import Link from "next/link";
import { NewChartForm } from "./form";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "명반 만들기",
};

export default function NewChartPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text"
        >
          <ChevronLeft className="size-4" /> 홈
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">紫微</span>
      </header>

      <div className="mt-2 text-center">
        <p className="font-display text-xs gold-text tracking-[0.4em]">出生情報</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold leading-tight">
          출생 정보를 입력하세요
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          한국 표준시 기준 · 정확한 명반을 위해 시(時)까지
        </p>
      </div>

      <div className="mt-8 palace-card rounded-2xl p-5 sm:p-6">
        <NewChartForm />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted leading-relaxed">
        💎 출생 정보는 명반 계산 외에 사용되지 않으며,
        <br />
        사용자 본인만 조회할 수 있습니다.
      </p>
    </main>
  );
}
