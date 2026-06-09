"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ChartOption = {
  id: string;
  subjectName: string | null;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: string;
};

export function CompatibilityForm({ charts }: { charts: ChartOption[] }) {
  const router = useRouter();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (a === b) return toast.error("서로 다른 명반을 선택하세요");
    setLoading(true);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartAId: a, chartBId: b }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "궁합 계산 실패");
      router.push(`/compatibility/${data.id}`);
    } catch (e: any) {
      toast.error(e.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>첫 번째 명반</Label>
        <ChartSelect charts={charts} value={a} onChange={setA} />
      </div>
      <div className="space-y-2">
        <Label>두 번째 명반</Label>
        <ChartSelect charts={charts} value={b} onChange={setB} exclude={a} />
      </div>
      <Button type="submit" disabled={!a || !b || loading} className="w-full" size="lg">
        {loading ? "분석 중…" : "궁합 보기"}
      </Button>
    </form>
  );
}

function ChartSelect({
  charts,
  value,
  onChange,
  exclude,
}: {
  charts: ChartOption[];
  value: string;
  onChange: (id: string) => void;
  exclude?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm focus:border-gold/50 focus:outline-none"
      required
    >
      <option value="">선택…</option>
      {charts
        .filter((c) => c.id !== exclude)
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.subjectName ?? "명반"} · {c.birthYear}.{c.birthMonth}.{c.birthDay} ({c.gender === "MALE" ? "남" : "여"})
          </option>
        ))}
    </select>
  );
}
