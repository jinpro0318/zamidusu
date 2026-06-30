import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "AI 해석" };

export default async function ChartAiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) redirect(`/chart/${id}`);

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[480px] flex-col px-4 safe-top">
      <header className="flex items-center justify-between py-3">
        <Link
          href={`/chart/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text"
        >
          <ChevronLeft className="size-4" /> 명반
        </Link>
        <span className="font-display text-sm gold-text tracking-wider">AI 해석</span>
      </header>

      <div className="border-b border-white/5 pb-3">
        <p className="text-xs text-muted">
          {chart.subjectName ?? "나의 명반"} · {chart.gender === "MALE" ? "남" : "여"}
        </p>
        <p className="text-[11px] text-muted/70 mt-1">
          AI가 12궁·14주성·사화를 종합해 답변합니다.
        </p>
      </div>

      <div className="flex-1 min-h-0 py-3 safe-bottom">
        <ChatPanel chartId={id} />
      </div>
    </main>
  );
}
