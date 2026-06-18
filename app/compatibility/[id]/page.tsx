import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGuestUserId } from "@/lib/guest";
import { CompatibilityResult } from "@/components/compatibility/CompatibilityResult";
import { CompatibilityReading } from "@/components/compatibility/CompatibilityReading";
import type { CompatibilityScore } from "@/lib/iztro/compatibility";
import { Z, SERIF, SANS } from "@/theme/tokens";

export const metadata = { title: "궁합 결과" };

type ChartRec = {
  id: string;
  subjectName: string | null;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  payload: string;
};

// payload에서 명궁 주성 이름들 추출(요약 표시용).
function soulStars(payload: string): string {
  try {
    const p = JSON.parse(payload);
    const soul = (p.palaces ?? []).find((x: any) => x.name === "명궁");
    const stars = (soul?.majorStars ?? []).map((s: any) => s.name).join(", ");
    return stars || "공궁(空宮)";
  } catch {
    return "";
  }
}

function PersonSummary({ chart, role, accent }: { chart: ChartRec; role: string; accent: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 16, padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
        <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.ink2 }}>{role}</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: Z.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {chart.subjectName?.trim() || "명반"}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: Z.ink2, marginTop: 2 }}>
        {chart.birthYear}.{String(chart.birthMonth).padStart(2, "0")}.{String(chart.birthDay).padStart(2, "0")} · {chart.gender === "MALE" ? "남" : "여"}
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 12.5, color: Z.goldBright, marginTop: 6, lineHeight: 1.4 }}>
        命 {soulStars(chart.payload)}
      </div>
    </div>
  );
}

export default async function CompatibilityResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user
    ? ((session.user as any).id as string)
    : await getGuestUserId();
  if (!userId) notFound();

  const rec = await db.compatibility.findFirst({
    where: { id, ownerId: userId },
    include: { chartA: true, chartB: true },
  });
  if (!rec) notFound();

  const score = JSON.parse(rec.detail) as CompatibilityScore;

  // 저장 시 chartA/chartB 순서가 id 정렬로 정규화되므로, 성별로 남/여를 다시 정한다.
  const a = rec.chartA as ChartRec;
  const b = rec.chartB as ChartRec;
  const male = a.gender === "MALE" ? a : b.gender === "MALE" ? b : a;
  const female = male === a ? b : a;
  const homeId = male.id; // ← HOME: 남자 명반으로

  return (
    <main style={{ minHeight: "100%", background: Z.cream, display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top) + 14px) 20px 8px",
        }}
      >
        <Link
          href={`/chart/${homeId}`}
          aria-label="홈으로 (남자 명반)"
          style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.ink2, letterSpacing: "0.12em", textDecoration: "none" }}
        >
          ← HOME
        </Link>
        <span style={{ fontFamily: SERIF, fontSize: 14, color: Z.p600, letterSpacing: "0.2em" }}>合婚</span>
      </header>

      <div style={{ padding: "6px 20px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 800, color: Z.ink, margin: 0 }}>궁합 결과</h1>
      </div>

      <div style={{ padding: "16px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* 상단: 두 사람 명반 요약 */}
        <div style={{ display: "flex", gap: 10 }}>
          <PersonSummary chart={male} role="남자 사주" accent={Z.p600} />
          <PersonSummary chart={female} role="여자 사주" accent="#C0463F" />
        </div>

        {/* 하단: 궁합 결과 */}
        <CompatibilityResult
          score={score}
          nameA={male.subjectName?.trim() || "남자"}
          nameB={female.subjectName?.trim() || "여자"}
        />

        {/* 하단: AI 관계 해석 (두 사람 관계 전용) */}
        <CompatibilityReading compatId={rec.id} />

        <p style={{ fontFamily: SANS, fontSize: 11, color: Z.ink3, lineHeight: 1.6, textAlign: "center" }}>
          ※ 점수는 자미두수 12궁·사화·오행국을 가중 합산한 추정치입니다.
          <br />
          절대적 호환도가 아닙니다.
        </p>

        <Link
          href="/compatibility"
          style={{
            textAlign: "center", textDecoration: "none",
            border: `1.5px dashed ${Z.p100}`, borderRadius: 14, padding: "12px",
            fontFamily: SANS, fontSize: 14, fontWeight: 700, color: Z.p600,
          }}
        >
          다른 궁합 보기
        </Link>
      </div>
    </main>
  );
}
