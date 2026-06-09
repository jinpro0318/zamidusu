import { astro } from "iztro";
import type { ChartInput } from "./types";

/**
 * 한국 표준 시간 hour(0-23) → iztro timeIndex(0-12 시진).
 * 23시는 조자시(早子, 0), 0시도 0 (자시). 학파에 따라 23시를 익일 자시로 보는 경우도 있어
 * UI에서 토글 옵션을 제공하는 것을 권장.
 */
export function hourToTimeIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

export function generateAstrolabe(input: ChartInput) {
  const timeIndex = hourToTimeIndex(input.hour);
  const gender = input.gender === "MALE" ? "male" : "female";
  const dateStr = `${input.year}-${input.month}-${input.day}`;

  if (input.calendar === "SOLAR") {
    return astro.astrolabeBySolarDate(dateStr, timeIndex, gender as "male" | "female", true, "ko-KR");
  }
  return astro.astrolabeByLunarDate(
    dateStr,
    timeIndex,
    gender as "male" | "female",
    input.isLeapMonth ?? false,
    true,
    "ko-KR",
  );
}
