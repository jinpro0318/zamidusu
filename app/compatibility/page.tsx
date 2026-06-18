import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompatibilityForm } from "./form";

export const metadata = { title: "자미두수 궁합" };

export default async function CompatibilityPage() {
  const session = await auth();
  // 회원 전용 — 게스트는 로그인 후 이 페이지로 복귀
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent("/compatibility")}`);
  }
  const userId = (session.user as any).id as string;

  // 저장 명반 목록(직접 입력도 가능하므로 0~1개여도 폼을 노출).
  const charts = await db.chart.findMany({
    where: { userId },
    select: {
      id: true, subjectName: true,
      birthYear: true, birthMonth: true, birthDay: true,
      gender: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 라이트 테마·헤더·레이아웃은 CompatibilityForm이 담당.
  return <CompatibilityForm charts={charts} />;
}
