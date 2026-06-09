import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // id는 chart.id 또는 shareToken 둘 다 허용 (공개 공유 페이지에서도 호출됨)
  const chart = await db.chart.findFirst({
    where: {
      OR: [{ id }, { shareToken: id }],
    },
  });
  if (!chart) {
    return new Response("Not found", { status: 404 });
  }

  const payload = JSON.parse(chart.payload);
  const soulPalace = payload.palaces?.find?.((p: any) => p.name?.includes?.("명"));
  const mainStars = soulPalace?.majorStars?.map?.((s: any) => s.name).join(" · ") || "공궁";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #15102a 0%, #241A3D 50%, #2c2150 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          color: "#FBF8F3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 28,
              color: "#E3C36B",
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            紫微斗數 · 자미두수
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {chart.subjectName ?? "나의 명반"}
          </div>
          <div style={{ marginTop: 12, fontSize: 30, opacity: 0.9 }}>
            {chart.gender === "MALE" ? "남" : "여"} · {payload.solarDate}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 24,
          }}
        >
          <Pill label="명궁" value={payload.earthlyBranchOfSoulPalace} />
          <Pill label="오행국" value={payload.fiveElementsClass} />
          <Pill label="신주" value={payload.soul} />
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 32,
            color: "#E3C36B",
          }}
        >
          ⭐ {mainStars}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            opacity: 0.7,
          }}
        >
          <span>zamidusu.app</span>
          <span style={{ color: "#E3C36B" }}>나의 무료 명반 만들기 →</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(227, 195, 107, 0.08)",
        border: "1px solid rgba(227, 195, 107, 0.3)",
        borderRadius: 12,
        padding: "12px 24px",
      }}
    >
      <span style={{ fontSize: 18, opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 700, color: "#E3C36B" }}>{value}</span>
    </div>
  );
}
