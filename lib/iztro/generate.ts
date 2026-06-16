import { astro } from "iztro";
import { lunar2solar } from "lunar-lite";
import type { ChartInput } from "./types";

/**
 * 한국 표준 시간 hour(0-23) → iztro timeIndex(0-11 시진).
 * 자시(子)는 hour=23으로 들어오며, generateAstrolabe에서 정자시법(다음 날 자시)으로 따로 처리한다.
 */
export function hourToTimeIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

/** 'YYYY-M-D' 솔라 날짜 하루 추가 (월/년 롤오버 안전). */
function nextSolarDate(year: number, month: number, day: number): string {
  const dt = new Date(Date.UTC(year, month - 1, day));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return `${dt.getUTCFullYear()}-${dt.getUTCMonth() + 1}-${dt.getUTCDate()}`;
}

export function generateAstrolabe(input: ChartInput) {
  const gender = (input.gender === "MALE" ? "male" : "female") as "male" | "female";
  const dateStr = `${input.year}-${input.month}-${input.day}`;

  // 정자시법: 자시(23:30~24:00, hour=23)는 "다음 날 자시"로 본다.
  //   입력 날짜를 솔라 기준으로 하루 더한 뒤 자시(timeIndex 0)로 계산.
  //   음력 입력도 솔라로 변환 후 +1일 → 솔라로 계산해 윤달/월말 롤오버를 안전 처리.
  //   (사주식 야자시/조자시 일주 분리는 하지 않음)
  if (input.hour === 23) {
    let y = input.year;
    let m = input.month;
    let d = input.day;
    if (input.calendar === "LUNAR") {
      const s = lunar2solar(dateStr, input.isLeapMonth ?? false);
      y = s.solarYear;
      m = s.solarMonth;
      d = s.solarDay;
    }
    const next = nextSolarDate(y, m, d);
    return astro.astrolabeBySolarDate(next, 0, gender, true, "ko-KR");
  }

  const timeIndex = hourToTimeIndex(input.hour);
  if (input.calendar === "SOLAR") {
    return astro.astrolabeBySolarDate(dateStr, timeIndex, gender, true, "ko-KR");
  }
  return astro.astrolabeByLunarDate(dateStr, timeIndex, gender, input.isLeapMonth ?? false, true, "ko-KR");
}
