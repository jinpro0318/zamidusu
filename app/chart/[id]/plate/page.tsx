import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { toAreas } from "@/lib/iztro/to-areas";
import { PlateClient } from "./client";
import type { AstrolabePayload } from "@/lib/iztro/types";

export const metadata = { title: "명반 차트" };

export default async function PlatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const chart = await db.chart.findFirst({ where: { id, userId } });
  if (!chart) notFound();

  const payload = JSON.parse(chart.payload) as AstrolabePayload;
  const areas = toAreas(payload);
  const birthLabel = `${chart.birthYear}.${String(chart.birthMonth).padStart(2, "0")}.${String(chart.birthDay).padStart(2, "0")} · ${payload.time} · ${chart.gender === "MALE" ? "男" : "女"}`;

  return <PlateClient areas={areas} birthLabel={birthLabel} chartId={chart.id} />;
}
