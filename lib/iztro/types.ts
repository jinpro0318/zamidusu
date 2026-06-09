// iztro 결과를 우리 도메인에 맞게 추출한 타입.
// iztro 공식 타입을 참조하되, 추후 라이브러리 메이저 업데이트 시 변경 가능성에 대비.

export type Gender = "MALE" | "FEMALE";
export type Calendar = "SOLAR" | "LUNAR";

export interface ChartInput {
  calendar: Calendar;
  year: number;
  month: number;
  day: number;
  hour: number; // 0-23
  minute: number;
  isLeapMonth?: boolean;
  gender: Gender;
  subjectName?: string;
}

export interface StarLite {
  name: string;
  type?: string;
  scope?: string;
  brightness?: string;
  mutagen?: string; // 사화: 화록/화권/화과/화기
}

export interface PalaceLite {
  index: number;
  name: string;
  isBodyPalace?: boolean;
  isOriginalPalace?: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: StarLite[];
  minorStars: StarLite[];
  adjectiveStars: StarLite[];
  decadal?: { range: number[]; heavenlyStem?: string; earthlyBranch?: string };
  ages?: number[];
}

export interface AstrolabePayload {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  sign?: string;
  zodiac?: string;
  earthlyBranchOfSoulPalace: string;
  earthlyBranchOfBodyPalace: string;
  soul: string;
  body: string;
  fiveElementsClass: string;
  palaces: PalaceLite[];
  iztroVersion: string;
}
