import type { AstrolabePayload, PalaceLite, StarLite } from "./types";

// iztro의 IFunctionalAstrolabe → 우리 도메인 JSON으로 압축
export function serializeAstrolabe(a: any, iztroVersion: string): AstrolabePayload {
  return {
    solarDate: a.solarDate,
    lunarDate: a.lunarDate,
    chineseDate: a.chineseDate,
    time: a.time,
    timeRange: a.timeRange,
    sign: a.sign,
    zodiac: a.zodiac,
    earthlyBranchOfSoulPalace: a.earthlyBranchOfSoulPalace,
    earthlyBranchOfBodyPalace: a.earthlyBranchOfBodyPalace,
    soul: a.soul,
    body: a.body,
    fiveElementsClass: a.fiveElementsClass,
    palaces: (a.palaces ?? []).map(serializePalace),
    iztroVersion,
  };
}

function serializePalace(p: any): PalaceLite {
  return {
    index: p.index,
    name: p.name,
    isBodyPalace: p.isBodyPalace,
    isOriginalPalace: p.isOriginalPalace,
    heavenlyStem: p.heavenlyStem,
    earthlyBranch: p.earthlyBranch,
    majorStars: (p.majorStars ?? []).map(serializeStar),
    minorStars: (p.minorStars ?? []).map(serializeStar),
    adjectiveStars: (p.adjectiveStars ?? []).map(serializeStar),
    decadal: p.decadal,
    ages: p.ages,
  };
}

function serializeStar(s: any): StarLite {
  return {
    name: s.name,
    type: s.type,
    scope: s.scope,
    brightness: s.brightness,
    mutagen: s.mutagen,
  };
}
