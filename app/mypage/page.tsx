import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft } from "lucide-react";

export const metadata = { title: "마이페이지" };

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const userId = (session.user as any).id as string;

  const charts = await db.chart.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <main className="mx-auto max-w-md sm:max-w-3xl px-5 pb-16 safe-bottom">
      <header className="flex items-center justify-between py-4 safe-top">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:gold-text">
          <ChevronLeft className="size-4" /> 홈
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="text-xs text-muted hover:gold-text">
            로그아웃
          </button>
        </form>
      </header>

      <div className="mt-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">마이페이지</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">{session.user.email}</p>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base sm:text-lg font-bold gold-text tracking-wider">
            내 명반
          </h2>
          <Link href="/chart/new">
            <Button variant="outline" size="sm">
              <Plus className="size-4" /> 새 명반
            </Button>
          </Link>
        </div>

        {charts.length === 0 ? (
          <div className="palace-card rounded-xl p-8 text-center text-sm text-muted">
            아직 명반이 없어요.
            <br />
            <Link href="/chart/new" className="mt-2 inline-block underline gold-text">
              첫 명반 만들기 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {charts.map((c) => (
              <Link key={c.id} href={`/chart/${c.id}`}>
                <div className="palace-card rounded-lg p-4 hover:border-gold/50 transition active:scale-[0.98]">
                  <p className="font-display gold-text text-base">{c.subjectName ?? "명반"}</p>
                  <p className="text-xs text-muted mt-1">
                    {c.birthYear}.{c.birthMonth}.{c.birthDay} ·{" "}
                    {c.gender === "MALE" ? "남" : "여"}
                  </p>
                  <p className="mt-3 text-[11px] text-muted/80">
                    {c.createdAt.toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
