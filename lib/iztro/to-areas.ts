// iztro AstrolabePayload를 ziwei-app의 Area[] 형식으로 변환.
// AREAS의 정적 c/r/h/ko 매핑은 데모용 — 실제 iztro 결과에서는 c/r은 4×4 plate 위치로 계산.

import type { Area, BrightnessKey } from "@/lib/ziwei-types";
import type { AstrolabePayload, PalaceLite } from "@/lib/iztro/types";

// iztro의 한국어 궁명 → ziwei-app의 한자 cn 매핑
const NAME_MAP: Record<string, { cn: string; h: string; ko: string }> = {
  명궁:   { cn: "命宮", h: "命", ko: "나·성격" },
  형제궁: { cn: "兄弟宮", h: "兄", ko: "형제·친구" },
  부처궁: { cn: "夫妻宮", h: "妻", ko: "연애·결혼" },
  자녀궁: { cn: "子女宮", h: "子", ko: "자녀·후배" },
  재백궁: { cn: "財帛宮", h: "財", ko: "돈·재물" },
  질액궁: { cn: "疾厄宮", h: "疾", ko: "건강·체질" },
  천이궁: { cn: "遷移宮", h: "遷", ko: "이동·해외" },
  교우궁: { cn: "奴僕宮", h: "友", ko: "대인관계" },
  관록궁: { cn: "官祿宮", h: "官", ko: "직업·커리어" },
  전택궁: { cn: "田宅宮", h: "宅", ko: "집·가정" },
  복덕궁: { cn: "福德宮", h: "福", ko: "복·취미" },
  부모궁: { cn: "父母宮", h: "父", ko: "부모·윗사람" },
};

// 4×4 plate 위치 (ziwei-app 기본 레이아웃과 일치)
const POSITION: Record<string, { c: number; r: number }> = {
  田宅宮: { c: 1, r: 1 },
  官祿宮: { c: 2, r: 1 },
  奴僕宮: { c: 3, r: 1 },
  遷移宮: { c: 4, r: 1 },
  福德宮: { c: 1, r: 2 },
  疾厄宮: { c: 4, r: 2 },
  父母宮: { c: 1, r: 3 },
  財帛宮: { c: 4, r: 3 },
  命宮:   { c: 1, r: 4 },
  兄弟宮: { c: 2, r: 4 },
  夫妻宮: { c: 3, r: 4 },
  子女宮: { c: 4, r: 4 },
};

// 한국어 별명 → 한자 (Plate가 한자 별을 기대)
const STAR_HANJA: Record<string, string> = {
  자미: "紫微", 천기: "天機", 태양: "太陽", 무곡: "武曲", 천동: "天同",
  염정: "廉貞", 천부: "天府", 태음: "太陰", 탐랑: "貪狼", 거문: "巨門",
  천상: "天相", 천량: "天梁", 칠살: "七殺", 파군: "破軍",
  좌보: "左輔", 우필: "右弼", 문창: "文昌", 문곡: "文曲",
  녹존: "祿存", 천마: "天馬",
};

// iztro brightness → BR 매핑 (廟旺平陷)
const BRIGHTNESS_MAP: Record<string, BrightnessKey> = {
  묘: "廟", 왕: "旺", 평: "平", 함: "陷",
  得地: "旺", 旺: "旺", 廟: "廟", 平: "平", 陷: "陷",
};

function defaultArea(name: string): { cn: string; h: string; ko: string } {
  // iztro의 ko-KR 로케일은 보통 궁(宮) suffix를 빼고 반환 (예: "부모", "부처", "형제").
  // NAME_MAP 키는 "부모궁"·"부처궁" 형식이라 그대로 룩업하면 명궁 1개만 매치되는 버그가 있었음.
  // suffix가 없는 케이스를 위해 "+ 궁" 변형을 폴백으로 시도.
  return NAME_MAP[name] ?? NAME_MAP[name + "궁"] ?? { cn: name, h: name[0] ?? "?", ko: name };
}

export function toAreas(payload: AstrolabePayload): Area[] {
  return payload.palaces.map((p): Area => {
    const meta = defaultArea(p.name);
    const pos = POSITION[meta.cn] ?? { c: 1, r: 1 };
    const stars = p.majorStars.map((s) => STAR_HANJA[s.name] ?? s.name);
    const leadStar = p.majorStars[0];
    const br: BrightnessKey =
      (leadStar?.brightness && BRIGHTNESS_MAP[leadStar.brightness]) || "平";

    return {
      h: meta.h,
      ko: meta.ko,
      cn: meta.cn,
      c: pos.c,
      r: pos.r,
      stars,
      br,
      line: lineFor(meta.cn, leadStar?.name),
      sel: p.name.includes("명"),
    };
  });
}

// 한 줄 요약 — 데모 카피. 추후 AI 또는 별도 lookup으로 강화 가능.
function lineFor(cn: string, leadStar?: string): string {
  const base: Record<string, string> = {
    命宮: "중심을 잡는 리더, 품위가 있어요",
    兄弟宮: "머리 좋은 친구·형제 복",
    夫妻宮: "감정이 깊고 헌신적인 인연",
    子女宮: "독립심 강한 아이·후배 인연",
    財帛宮: "벌이는 좋아요, 씀씀이만 챙기면 OK",
    疾厄宮: "기력은 좋되 과로는 주의",
    遷移宮: "움직일수록 기회가 열려요",
    奴僕宮: "사람을 끄는 힘, 인맥이 자산",
    官祿宮: "책임지는 자리에서 빛나는 타입",
    田宅宮: "안정된 보금자리와 가정 운이 따라요",
    福德宮: "생각이 깊고 취향이 분명해요",
    父母宮: "윗사람의 도움을 받는 운",
  };
  return base[cn] ?? (leadStar ? `${leadStar} 기운이 강해요` : "");
}
