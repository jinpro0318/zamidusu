"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Z, SERIF, SANS } from "@/theme/tokens";
import { PrimaryBtn, Seg } from "@/components/ziwei/atoms";
import { Label, TextInput, TapField, PickerSheet } from "@/components/ziwei/common";
import { SIJIN_LABELS, timeToHour } from "@/data/sijin";

type ChartOption = {
  id: string;
  subjectName: string | null;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: string;
};

type Mode = "saved" | "direct";
interface Person {
  mode: Mode;
  savedId: string;
  cal: string; // 양력 | 음력 | 음력(윤달)
  yy: string;
  mm: string;
  dd: string;
  time: string; // 시진 라벨
  name: string;
}

const emptyPerson = (): Person => ({
  mode: "saved",
  savedId: "",
  cal: "양력",
  yy: "1990년",
  mm: "5월",
  dd: "20일",
  time: "",
  name: "",
});

const YEARS = (() => {
  const a: string[] = [];
  for (let y = 2012; y >= 1950; y--) a.push(y + "년");
  return a;
})();
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

function daysOf(cal: string, yy: string, mm: string): string[] {
  const yearN = parseInt(yy, 10) || 1990;
  const monthN = parseInt(mm, 10) || 1;
  const maxDay = cal === "양력" ? new Date(yearN, monthN, 0).getDate() : 30;
  return Array.from({ length: maxDay }, (_, i) => `${i + 1}일`);
}

interface PickerCfg {
  title: string;
  options: string[];
  value: string;
  set: (v: string) => void;
}

export function CompatibilityForm({ charts, fromChartId }: { charts: ChartOption[]; fromChartId?: string }) {
  const router = useRouter();
  const [male, setMale] = useState<Person>(emptyPerson);
  const [female, setFemale] = useState<Person>(emptyPerson);
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState<PickerCfg | null>(null);

  // ← HOME: 진입 출처(from) 명반이 있으면 거기로 복귀(예: 내 명반에서 궁합으로 들어온 경우),
  // 없으면 남자 저장 명반 → 마이페이지 순으로 폴백.
  const homeHref = fromChartId
    ? `/chart/${fromChartId}`
    : male.mode === "saved" && male.savedId
      ? `/chart/${male.savedId}`
      : "/mypage";

  // 한 사람 입력 → chartId 확정(저장: 그대로 / 직접: 명반 생성).
  async function resolveChartId(p: Person, gender: "MALE" | "FEMALE", who: string): Promise<string> {
    if (p.mode === "saved") {
      if (!p.savedId) throw new Error(`${who} 명반을 선택해 주세요.`);
      return p.savedId;
    }
    if (!p.time) throw new Error(`${who}의 태어난 시간을 선택해 주세요.`);
    const res = await fetch("/api/charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectName: p.name || undefined,
        gender,
        calendar: p.cal.startsWith("음력") ? "LUNAR" : "SOLAR",
        year: parseInt(p.yy, 10),
        month: parseInt(p.mm, 10),
        day: parseInt(p.dd, 10),
        hour: timeToHour(p.time),
        minute: 0,
        isLeapMonth: p.cal === "음력(윤달)",
      }),
    });
    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : null;
    if (!res.ok || !data?.id) throw new Error(data?.error ?? `${who} 명반 생성에 실패했어요.`);
    return data.id as string;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const chartAId = await resolveChartId(male, "MALE", "남자");
      const chartBId = await resolveChartId(female, "FEMALE", "여자");
      if (chartAId === chartBId) throw new Error("서로 다른 사주를 선택해 주세요.");
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartAId, chartBId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "궁합 계산에 실패했어요.");
      router.push(`/compatibility/${data.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? "궁합 계산 실패");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", background: Z.cream, display: "flex", flexDirection: "column" }}>
      {/* 헤더 — HOME(남자 명반/마이페이지) */}
      <header
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "calc(env(safe-area-inset-top) + 14px) 20px 8px",
        }}
      >
        <Link
          href={homeHref}
          aria-label="홈으로"
          style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: Z.ink2, letterSpacing: "0.12em", textDecoration: "none" }}
        >
          ← HOME
        </Link>
        <span style={{ fontFamily: SERIF, fontSize: 14, color: Z.p600, letterSpacing: "0.2em" }}>合婚</span>
      </header>

      <div style={{ padding: "6px 20px 0", textAlign: "center" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 800, color: Z.ink, margin: 0 }}>자미두수 궁합</h1>
        <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink2, margin: "6px 0 0" }}>
          두 사람의 사주를 선택하거나 직접 입력해 비교해요
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ padding: "18px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        <PersonPicker title="남자 사주" accent={Z.p600} charts={charts} value={male} onChange={setMale} openPicker={(c) => setPicker(c)} />
        <PersonPicker title="여자 사주" accent="#C0463F" charts={charts} value={female} onChange={setFemale} openPicker={(c) => setPicker(c)} />

        <PrimaryBtn type="submit" disabled={loading} style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}>
          {loading ? "궁합 분석 중…" : "궁합 보기"}
        </PrimaryBtn>
      </form>

      <PickerSheet
        open={!!picker}
        title={picker?.title}
        options={picker?.options || []}
        value={picker?.value}
        onPick={(o) => picker?.set(o)}
        onClose={() => setPicker(null)}
      />
    </div>
  );
}

function PersonPicker({
  title,
  accent,
  charts,
  value,
  onChange,
  openPicker,
}: {
  title: string;
  accent: string;
  charts: ChartOption[];
  value: Person;
  onChange: (p: Person) => void;
  openPicker: (cfg: PickerCfg) => void;
}) {
  const p = value;
  const set = (patch: Partial<Person>) => onChange({ ...p, ...patch });
  const DAYS = useMemo(() => daysOf(p.cal, p.yy, p.mm), [p.cal, p.yy, p.mm]);

  return (
    <section style={{ background: Z.white, border: `1px solid ${Z.line}`, borderRadius: 18, padding: "15px 15px 16px", boxShadow: "0 2px 10px rgba(36,26,61,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: Z.ink }}>{title}</span>
      </div>

      <Seg
        options={["저장 명반에서 선택", "직접 입력"]}
        value={p.mode === "saved" ? "저장 명반에서 선택" : "직접 입력"}
        onChange={(v) => set({ mode: v === "직접 입력" ? "direct" : "saved" })}
      />

      {p.mode === "saved" ? (
        <div style={{ marginTop: 12 }}>
          {charts.length === 0 ? (
            <p style={{ fontFamily: SANS, fontSize: 13, color: Z.ink3, margin: "4px 2px" }}>
              저장된 명반이 없어요. "직접 입력"으로 진행해 주세요.
            </p>
          ) : (
            <select
              value={p.savedId}
              onChange={(e) => set({ savedId: e.target.value })}
              style={{
                width: "100%", boxSizing: "border-box", appearance: "none",
                background: Z.white, border: `1.5px solid ${Z.line}`, borderRadius: 13,
                padding: "13px 14px", fontFamily: SANS, fontSize: 15, color: p.savedId ? Z.ink : Z.ink3, outline: "none",
              }}
            >
              <option value="">명반 선택…</option>
              {charts.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.subjectName ?? "명반")} · {c.birthYear}.{c.birthMonth}.{c.birthDay} ({c.gender === "MALE" ? "남" : "여"})
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <Label req>달력</Label>
            <Seg options={["양력", "음력", "음력(윤달)"]} value={p.cal} onChange={(v) => set({ cal: v })} />
          </div>
          <div>
            <Label req>생년월일</Label>
            <div style={{ display: "flex", gap: 8 }}>
              <TapField flex={1.2} onClick={() => openPicker({ title: "태어난 해", options: YEARS, value: p.yy, set: (v) => set({ yy: v }) })}>{p.yy}</TapField>
              <TapField flex={1} onClick={() => openPicker({ title: "태어난 달", options: MONTHS, value: p.mm, set: (v) => set({ mm: v }) })}>{p.mm}</TapField>
              <TapField flex={1} onClick={() => openPicker({ title: "태어난 날", options: DAYS, value: p.dd, set: (v) => set({ dd: v }) })}>{p.dd}</TapField>
            </div>
          </div>
          <div>
            <Label req>태어난 시간</Label>
            <TapField ph="시진을 선택하세요" onClick={() => openPicker({ title: "태어난 시간 (12시진)", options: SIJIN_LABELS, value: p.time, set: (v) => set({ time: v }) })}>
              {p.time}
            </TapField>
          </div>
          <div>
            <Label>이름 · 별칭 <span style={{ color: Z.ink3, fontWeight: 400 }}>(선택)</span></Label>
            <TextInput value={p.name} onChange={(v) => set({ name: v })} ph="표시할 이름" />
          </div>
        </div>
      )}
    </section>
  );
}
