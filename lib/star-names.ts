// 별 이름 한자 ↔ 한글 표기 유틸 — 별 한자 매핑의 단일 출처.
// (lib/iztro/to-areas.ts도 여기 STAR_HANJA를 재사용한다.)

export const STAR_KO: Record<string, string> = {
  紫微: "자미", 天機: "천기", 太陽: "태양", 武曲: "무곡", 天同: "천동",
  廉貞: "염정", 天府: "천부", 太陰: "태음", 貪狼: "탐랑", 巨門: "거문",
  天相: "천상", 天梁: "천량", 七殺: "칠살", 破軍: "파군",
  左輔: "좌보", 右弼: "우필", 文昌: "문창", 文曲: "문곡",
  祿存: "녹존", 天馬: "천마",
};

/** 한글 별 이름 → 정자 한자 (STAR_KO의 역). 별 한자의 단일 진실원. */
export const STAR_HANJA: Record<string, string> = Object.fromEntries(
  Object.entries(STAR_KO).map(([hanja, ko]) => [ko, hanja]),
);

/** 한자 별 이름 → 한글 (매핑 없으면 입력 그대로) */
export function starKo(hanja: string): string {
  return STAR_KO[hanja] ?? hanja;
}

/** 한글 별 이름 → 정자 한자 (매핑 없으면 입력 그대로). 예: 천동 → 天同 */
export function starHanja(ko: string): string {
  return STAR_HANJA[ko] ?? ko;
}

/** "한글(한자)" 병기 표기. 예: 武曲 → "무곡(武曲)" */
export function starWithHanja(hanja: string): string {
  const ko = STAR_KO[hanja];
  return ko ? `${ko}(${hanja})` : hanja;
}

// 별 밝기(iztro 원값: 묘/왕/평/함, 得地, 또는 한자 廟旺平陷 등) → 정규화 키(廟旺得利平不陷).
const BRIGHTNESS_NORM: Record<string, string> = {
  묘: "廟", 왕: "旺", 득: "得", 이: "利", 평: "平", 불: "不", 함: "陷",
  得地: "旺", 廟: "廟", 旺: "旺", 得: "得", 利: "利", 平: "平", 不: "不", 陷: "陷",
};
// 정규화 키 → 사용자에게 보여줄 한국어 밝기 라벨 (AI 프롬프트 주입용).
const BRIGHTNESS_LABEL: Record<string, string> = {
  廟: "매우 밝게", 旺: "밝게", 得: "양호하게", 利: "양호하게", 平: "보통", 不: "약하게", 陷: "약하게",
};

/** iztro 밝기 원값 → 한국어 라벨. 알 수 없으면 '' (괄호 생략 용). */
export function brightnessLabel(raw?: string | null): string {
  if (!raw) return "";
  const key = BRIGHTNESS_NORM[raw];
  return (key && BRIGHTNESS_LABEL[key]) || "";
}
