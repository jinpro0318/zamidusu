import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroEmblem } from "@/components/marketing/HeroEmblem";
import { Sparkles, Heart, Share2, Clock, Bot, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative">
      {/* === 모바일 풀스크린 히어로 === */}
      <section className="relative flex min-h-dvh flex-col items-center px-5 pt-8 pb-12 safe-top safe-bottom">
        {/* 상단 네비 — 모바일 최소화 */}
        <nav className="flex w-full max-w-md items-center justify-between">
          <span className="font-display text-base font-bold gold-text tracking-wide">紫微</span>
          <Link href="/sign-in" className="text-xs text-muted hover:gold-text">
            로그인
          </Link>
        </nav>

        {/* 중앙 엠블럼 — 화면 비율에 따라 자연 축소 */}
        <div className="flex flex-1 w-full max-w-md flex-col items-center justify-center">
          <HeroEmblem className="w-full max-w-[420px] aspect-[5/6]" />
        </div>

        {/* CTA — 엠블럼 아래 고정 영역 */}
        <div className="w-full max-w-md space-y-3">
          <Link href="/chart/new" className="block">
            <Button size="lg" className="w-full text-base font-display">
              <Sparkles className="size-4" /> 나의 명반 만들기
            </Button>
          </Link>
          <p className="text-center text-xs text-muted">
            로그인 없이 즉시 체험 · 양력/음력 모두 지원
          </p>
        </div>

        {/* 스크롤 큐 */}
        <a
          href="#features"
          className="mt-6 inline-flex items-center gap-1 text-xs text-muted/70 hover:gold-text transition"
        >
          더 알아보기
          <ChevronRight className="size-3 rotate-90" />
        </a>
      </section>

      {/* === 차별점 4가지 === */}
      <section id="features" className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-md sm:max-w-3xl lg:max-w-5xl">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-center leading-tight">
            다른 자미두수 사이트와
            <br className="sm:hidden" />
            <span className="gold-text"> 무엇이 다른가요?</span>
          </h2>

          <div className="mt-10 sm:mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Bot className="size-5" />}
              title="AI 명반 해석 챗봇"
              description="Claude 4 + 내 명반 컨텍스트. '내 부처궁 풀어줘' 같은 자유 질문이 가능합니다."
            />
            <Feature
              icon={<Heart className="size-5" />}
              title="자미두수 궁합 분석"
              description="두 명반의 12궁·사화·오행국을 종합 비교. 사주가 아닌 자미두수로 보는 궁합."
            />
            <Feature
              icon={<Share2 className="size-5" />}
              title="공유 카드 자동 생성"
              description="인스타·카카오톡으로 바로 공유할 수 있는 자색·금색 명반 카드."
            />
            <Feature
              icon={<Clock className="size-5" />}
              title="대운·유년 타임라인"
              description="10년 단위 대운을 인터랙티브 그래프로. '2026년의 나'를 즉시 확인."
            />
          </div>
        </div>
      </section>

      {/* === 자미두수 소개 === */}
      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-md sm:max-w-2xl text-center">
          <p className="font-display text-sm gold-text tracking-[0.4em] mb-3">紫微斗數</p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold">
            왜 <span className="gold-text">자미두수</span>인가요?
          </h2>
          <p className="mt-6 text-sm sm:text-base text-muted leading-relaxed">
            자미두수는 송나라 진희이(陳希夷)가 창안한
            <br />
            동양 명리학의 정수입니다.
          </p>
          <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
            출생 시간만으로 12궁(宮)에 14주성을 배치하여,
            <br />
            사주보다 입체적으로 명운·재물·연애·건강을
            <br />
            풀어냅니다.
          </p>

          <Link href="/chart/new" className="mt-10 inline-block">
            <Button size="lg" className="font-display">
              지금 시작하기 <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* === 푸터 === */}
      <footer className="border-t border-white/5 px-5 py-10 safe-bottom">
        <div className="mx-auto max-w-md sm:max-w-3xl text-center text-xs text-muted/80">
          © 2026 zamidusu
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          자미두수는 오락·문화적 목적으로 제공됩니다.
          <br />
          인생의 중요한 결정은 전문가와 상담하세요.
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="palace-card rounded-xl p-5">
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-gold/15 gold-text">
        {icon}
      </div>
      <h3 className="font-display text-base sm:text-lg font-bold gold-text">{title}</h3>
      <p className="mt-1.5 text-xs sm:text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
