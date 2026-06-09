import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroEmblem } from "@/components/marketing/HeroEmblem";
import {
  Sparkles,
  Heart,
  Share2,
  Clock,
  Bot,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative">
      {/* === 풀스크린 히어로 === */}
      <section className="relative flex min-h-dvh flex-col items-center px-5 pt-8 pb-12 safe-top safe-bottom">
        <nav className="flex w-full max-w-md items-center justify-between">
          <span className="font-display text-base font-bold gold-text tracking-wide">紫微</span>
          <Link href="/sign-in" className="text-xs text-muted hover:gold-text transition">
            로그인
          </Link>
        </nav>

        <div className="flex flex-1 w-full max-w-md flex-col items-center justify-center">
          <HeroEmblem className="w-full max-w-[420px] aspect-[5/6]" />
        </div>

        <div className="w-full max-w-md space-y-3">
          <Link href="/chart/new" className="block">
            <Button size="lg" className="w-full text-base font-display">
              <Sparkles className="size-4" /> 나의 명반 만들기
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <span className="inline-block size-1 rounded-full bg-gold/60" />
            로그인 없이 즉시 체험
            <span className="inline-block size-1 rounded-full bg-gold/60" />
            양력/음력 지원
          </div>
        </div>

        <a
          href="#features"
          className="mt-6 inline-flex flex-col items-center text-[10px] text-muted/70 hover:gold-text transition"
        >
          더 알아보기
          <ChevronDown className="size-3 animate-bounce mt-0.5" />
        </a>
      </section>

      {/* === 4대 차별점 === */}
      <section id="features" className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-md sm:max-w-4xl">
          <div className="text-center">
            <p className="font-display text-xs gold-text tracking-[0.4em]">DIFFERENCE</p>
            <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold leading-tight">
              다른 자미두수 사이트와
              <br className="sm:hidden" />
              <span className="gold-text"> 무엇이 다른가요?</span>
            </h2>
          </div>

          <div className="mt-10 sm:mt-14 grid gap-3 sm:grid-cols-2">
            <BigFeature
              num="01"
              icon={<Bot className="size-6" />}
              tag="AI · GEMINI"
              title="AI 명반 해석 챗봇"
              description="Google Gemini가 내 명반 12궁·14주성·사화를 모두 읽고 답합니다. '내 부처궁 풀어줘' 같은 자유 질문이 가능해요."
            />
            <BigFeature
              num="02"
              icon={<Heart className="size-6" />}
              tag="합혼 · 合婚"
              title="자미두수 궁합 분석"
              description="두 명반의 12궁·사화·오행국을 종합 비교. 사주가 아닌 자미두수로 보는 입체 궁합."
            />
            <BigFeature
              num="03"
              icon={<Share2 className="size-6" />}
              tag="공유 · SHARE"
              title="공유 카드 자동 생성"
              description="인스타·카카오톡으로 바로 공유할 수 있는 자색·금색 명반 카드를 1초 만에."
            />
            <BigFeature
              num="04"
              icon={<Clock className="size-6" />}
              tag="대운 · 大運"
              title="대운·유년 타임라인"
              description="10년 단위 대운을 인터랙티브 그래프로. '2026년의 나'를 점 하나로 클릭."
            />
          </div>
        </div>
      </section>

      {/* === 자미두수란? === */}
      <section className="px-5 py-16 sm:py-24 border-t border-white/5">
        <div className="mx-auto max-w-md sm:max-w-2xl text-center">
          <p className="font-display text-xs gold-text tracking-[0.4em]">紫微斗數</p>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold">
            왜 <span className="gold-text">자미두수</span>인가요?
          </h2>
          <p className="mt-6 text-sm sm:text-base text-muted leading-relaxed">
            자미두수는 송나라 진희이(陳希夷)가 창안한 동양 명리학의 정수입니다.
            출생 시간만으로 12궁(宮)에 14주성을 배치하여, 사주보다 입체적으로
            명운·재물·연애·건강을 풀어냅니다.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            <Stat number="12" label="궁(宮)" />
            <Stat number="14" label="주성(主星)" />
            <Stat number="4" label="사화(四化)" />
          </div>

          <Link href="/chart/new" className="mt-10 inline-block">
            <Button size="lg" className="font-display">
              지금 시작하기 <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 px-5 py-10 safe-bottom">
        <div className="mx-auto max-w-md sm:max-w-3xl text-center text-xs text-muted/80">
          © 2026 zamidusu
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          오락·문화적 목적으로 제공됩니다.
          <br />
          인생의 중요한 결정은 전문가와 상담하세요.
        </div>
      </footer>
    </main>
  );
}

function BigFeature({
  num,
  icon,
  tag,
  title,
  description,
}: {
  num: string;
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="palace-card rounded-2xl p-5 sm:p-6 relative overflow-hidden group transition hover:-translate-y-0.5 hover:border-gold/60">
      <span className="absolute top-4 right-5 font-display text-5xl text-gold/10 select-none">
        {num}
      </span>
      <div className="relative">
        <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gold/15 gold-text mb-4">
          {icon}
        </div>
        <p className="text-[10px] gold-text tracking-[0.3em]">{tag}</p>
        <h3 className="mt-1 font-display text-lg sm:text-xl font-bold">{title}</h3>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="palace-card rounded-xl p-4 text-center">
      <p className="font-display text-3xl sm:text-4xl gold-text font-bold leading-none">{number}</p>
      <p className="mt-1 text-[11px] text-muted tracking-wider">{label}</p>
    </div>
  );
}
