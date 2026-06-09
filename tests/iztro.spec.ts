import { describe, it, expect } from "vitest";
import { generateAstrolabe, hourToTimeIndex } from "@/lib/iztro/generate";
import { serializeAstrolabe } from "@/lib/iztro/serialize";

describe("hourToTimeIndex", () => {
  it("23시 → 0 (자시)", () => {
    expect(hourToTimeIndex(23)).toBe(0);
  });
  it("0시 → 0 (자시)", () => {
    expect(hourToTimeIndex(0)).toBe(0);
  });
  it("2시 → 1 (축시)", () => {
    expect(hourToTimeIndex(2)).toBe(1);
  });
  it("12시 → 6 (오시)", () => {
    expect(hourToTimeIndex(12)).toBe(6);
  });
});

describe("generateAstrolabe — known case (2000-08-16 02시 남 양력)", () => {
  it("12궁이 생성된다", () => {
    const a = generateAstrolabe({
      calendar: "SOLAR",
      year: 2000,
      month: 8,
      day: 16,
      hour: 2,
      minute: 0,
      gender: "MALE",
    });
    expect(a.palaces).toHaveLength(12);
  });

  it("직렬화 후 핵심 필드가 살아 있다", () => {
    const a = generateAstrolabe({
      calendar: "SOLAR",
      year: 2000,
      month: 8,
      day: 16,
      hour: 2,
      minute: 0,
      gender: "MALE",
    });
    const p = serializeAstrolabe(a, "2.5.8");
    expect(p.palaces).toHaveLength(12);
    expect(p.earthlyBranchOfSoulPalace).toBeTruthy();
    expect(p.fiveElementsClass).toBeTruthy();
  });
});
