import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntitlements } from "@/lib/entitlements";
import { MypageClient } from "./client";

export const metadata = { title: "마이페이지" };

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?next=/mypage");
  const userId = (session.user as any).id as string;

  const [charts, user, entitlements, compatCount] = await Promise.all([
    db.chart.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true, subjectName: true,
        birthYear: true, birthMonth: true, birthDay: true,
        birthHour: true, gender: true,
      },
    }),
    db.user.findUnique({ where: { id: userId }, select: { name: true, createdAt: true } }),
    getEntitlements(userId),
    db.compatibility.count({ where: { ownerId: userId } }).catch(() => 0),
  ]);

  const saved = charts.map((c) => ({
    id: c.id,
    label: c.subjectName ?? "내 명반",
    sub: `${c.birthYear}.${String(c.birthMonth).padStart(2, "0")}.${String(c.birthDay).padStart(2, "0")} · ${branchOfHour(c.birthHour)} · ${c.gender === "MALE" ? "男" : "女"}`,
    cn: "命",
  }));

  const nickname = user?.name?.trim() || (session.user.email ?? "회원").split("@")[0];
  const joinedAt = user?.createdAt
    ? `${user.createdAt.getFullYear()}.${String(user.createdAt.getMonth() + 1).padStart(2, "0")}.${String(user.createdAt.getDate()).padStart(2, "0")}`
    : "";

  return (
    <MypageClient
      email={session.user.email ?? ""}
      nickname={nickname}
      plan={entitlements.plan}
      joinedAt={joinedAt}
      chartCount={charts.length}
      compatCount={compatCount}
      saved={saved}
    />
  );
}

function branchOfHour(h: number): string {
  const map = ["子", "丑", "丑", "寅", "寅", "卯", "卯", "辰", "辰", "巳", "巳", "午", "午", "未", "未", "申", "申", "酉", "酉", "戌", "戌", "亥", "亥", "子"];
  return (map[h] ?? "子") + "時";
}
