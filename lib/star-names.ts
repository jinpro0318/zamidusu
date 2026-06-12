// 별 이름 한자 ↔ 한글 표기 유틸.
// Area.stars에는 한자가 저장됨 (lib/iztro/to-areas.ts의 STAR_HANJA 참고) — 여기는 그 역방향.

export const STAR_KO: Record<string, string> = {
  紫微: "자미", 天機: "천기", 太陽: "태양", 武曲: "무곡", 天同: "천동",
  廉貞: "염정", 天府: "천부", 太陰: "태음", 貪狼: "탐랑", 巨門: "거문",
  天相: "천상", 天梁: "천량", 七殺: "칠살", 破軍: "파군",
  左輔: "좌보", 右弼: "우필", 文昌: "문창", 文曲: "문곡",
  祿存: "녹존", 天馬: "천마",
};

/** 한자 별 이름 → 한글 (매핑 없으면 입력 그대로) */
export function starKo(hanja: string): string {
  return STAR_KO[hanja] ?? hanja;
}

/** "한글(한자)" 병기 표기. 예: 武曲 → "무곡(武曲)" */
export function starWithHanja(hanja: string): string {
  const ko = STAR_KO[hanja];
  return ko ? `${ko}(${hanja})` : hanja;
}
