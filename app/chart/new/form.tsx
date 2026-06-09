"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewChartForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<"SOLAR" | "LUNAR">("SOLAR");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const date = form.get("date") as string;
      const [year, month, day] = date.split("-").map(Number);
      const hour = Number(form.get("hour"));
      const subjectName = (form.get("subjectName") as string) || undefined;

      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName,
          gender,
          calendar,
          year,
          month,
          day,
          hour,
          minute: 0,
          isLeapMonth: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "명반 생성 실패");
      router.push(`/chart/${data.id}`);
    } catch (e: any) {
      toast.error(e.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="별칭 (선택)">
        <Input
          name="subjectName"
          placeholder="예: 나의 명반"
          maxLength={40}
          autoComplete="off"
        />
      </Field>

      <Field label="달력">
        <SegControl
          value={calendar}
          onChange={setCalendar}
          options={[
            { value: "SOLAR", label: "양력" },
            { value: "LUNAR", label: "음력" },
          ]}
        />
      </Field>

      <Field label="생년월일">
        <Input
          name="date"
          type="date"
          required
          min="1900-01-01"
          max="2100-12-31"
        />
      </Field>

      <Field label="출생 시간">
        <select
          name="hour"
          className="h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 text-base text-foreground focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none"
          required
          defaultValue=""
        >
          <option value="" disabled>
            출생 시간을 선택하세요
          </option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={i}>
              {String(i).padStart(2, "0")}시 — {timeBranch(i)}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted">
          23시 출생자는 학파에 따라 익일 자시로 해석될 수 있습니다.
        </p>
      </Field>

      <Field label="성별">
        <SegControl
          value={gender}
          onChange={setGender}
          options={[
            { value: "MALE", label: "남" },
            { value: "FEMALE", label: "여" },
          ]}
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        className="w-full font-display"
        size="lg"
      >
        {loading ? "명반 계산 중…" : "명반 만들기 →"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs gold-text tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function SegControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-11 rounded-md border text-sm transition",
            value === o.value
              ? "border-gold bg-gold/10 gold-text font-medium"
              : "border-white/10 hover:border-white/30 text-foreground/80",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function timeBranch(hour: number): string {
  if (hour === 23 || hour === 0) return "子 자시";
  if (hour === 1 || hour === 2) return "丑 축시";
  if (hour === 3 || hour === 4) return "寅 인시";
  if (hour === 5 || hour === 6) return "卯 묘시";
  if (hour === 7 || hour === 8) return "辰 진시";
  if (hour === 9 || hour === 10) return "巳 사시";
  if (hour === 11 || hour === 12) return "午 오시";
  if (hour === 13 || hour === 14) return "未 미시";
  if (hour === 15 || hour === 16) return "申 신시";
  if (hour === 17 || hour === 18) return "酉 유시";
  if (hour === 19 || hour === 20) return "戌 술시";
  return "亥 해시";
}
