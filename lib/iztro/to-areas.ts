// iztro AstrolabePayload를 ziwei-app의 Area[] 형식으로 변환.
// AREAS의 정적 c/r/h/ko 매핑은 데모용 — 실제 iztro 결과에서는 c/r은 4×4 plate 위치로 계산.

import type { Area, BrightnessKey } from "@/lib/ziwei-types";
import type { AstrolabePayload, PalaceLite } from "@/lib/iztro/types";
import { STAR_HANJA } from "@/lib/star-names"; // 별 한자 매핑 단일 출처

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
  // iztro ko-KR 로케일이 교우궁을 "노복"으로 반환하는 케이스 별칭
  노복궁: { cn: "奴僕宮", h: "友", ko: "대인관계" },
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

// 한국어 별명 → 한자: lib/star-names.ts의 STAR_HANJA 재사용(단일 출처).

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

// adjectiveStars(잡성) 중 카드에 노출할 주요 별만 선별 (경쟁사 노출 기준 참고)
const NOTABLE_ADJECTIVE = new Set(["천형", "천요", "홍란", "천희"]);

export function toAreas(payload: AstrolabePayload): Area[] {
  return payload.palaces.map((p): Area => {
    const meta = defaultArea(p.name);
    const pos = POSITION[meta.cn] ?? { c: 1, r: 1 };
    // 구버전/부분 payload 방어: majorStars 누락 시 .map에서 터지지 않게 한다.
    const majorStars = p.majorStars ?? [];
    const stars = majorStars.map((s) => STAR_HANJA[s.name] ?? s.name);
    // 보조성: 육길·육살성(minorStars) 전부 + 주요 잡성. 구버전 payload에는 없을 수 있어 방어.
    const subStars = [
      ...(p.minorStars ?? []).map((s) => s.name),
      ...(p.adjectiveStars ?? []).filter((s) => NOTABLE_ADJECTIVE.has(s.name)).map((s) => s.name),
    ];
    const leadStar = majorStars[0];
    const secondStar = majorStars[1];
    const br: BrightnessKey =
      (leadStar?.brightness && BRIGHTNESS_MAP[leadStar.brightness]) || "平";

    return {
      h: meta.h,
      ko: meta.ko,
      cn: meta.cn,
      c: pos.c,
      r: pos.r,
      stars,
      subStars,
      br,
      line: lineFor(meta.cn, leadStar?.name, secondStar?.name),
      sel: p.name.includes("명"),
    };
  });
}

// ── 주성별 핵심 문구 (명반에 따라 달라지는 소제목) ──────────────────────────
// iztro ko-KR 로케일의 한글 별 이름을 키로 사용.
const STAR_LINE: Record<string, string> = {
  자미: "중심을 잡는 리더, 품격이 있어요",
  천기: "영리하고 전략적인 두뇌형",
  태양: "밝게 비추는 열정적인 활동파",
  무곡: "결단력 있는 추진형, 실력으로 승부",
  천동: "온화하고 복이 많은 낙천가",
  염정: "뜨거운 카리스마, 강한 집중력",
  천부: "넉넉하고 안정적인 재상 기질",
  태음: "섬세하고 깊은 감수성의 소유자",
  탐랑: "매력 넘치고 다재다능한 욕망형",
  거문: "말이 힘이 되는 분석적 논리파",
  천상: "균형을 잡는 보좌형, 신뢰가 두터워요",
  천량: "어른다운 책임감, 사람을 보살펴요",
  칠살: "독립적이고 강렬한 개척형",
  파군: "변화를 이끄는 혁신적인 선구자",
};

// 두 별이 함께 있는 동궁(同宮) 조합 문구 — 자미두수의 실제 동궁 가능 조합만 수록.
// 키 형식: "주성1+주성2" (순서 무관, 양방향 조회)
const COMBO_LINE: Record<string, string> = {
  "자미+천부": "중심을 잡는 리더, 품위가 있어요",
  "자미+탐랑": "카리스마와 매력을 겸비한 리더형",
  "자미+천상": "품격 있는 중심, 믿음을 주는 사람",
  "자미+천량": "품위 있는 어른, 인정받는 리더형",
  "자미+칠살": "강인하고 결단력 있는 리더",
  "자미+파군": "변화를 이끄는 강한 카리스마형",
  "무곡+천부": "든든하고 현실적인 재무형 실력파",
  "무곡+탐랑": "강한 욕망과 추진력을 갖춘 타입",
  "무곡+천상": "꼼꼼하고 책임감 있는 실무형",
  "무곡+칠살": "독자적으로 밀어붙이는 강렬한 실력파",
  "무곡+파군": "거침없이 변화를 개척하는 돌파형",
  "염정+천부": "열정과 안정감을 갖춘 카리스마형",
  "염정+천상": "카리스마 있고 균형 잡힌 보좌형",
  "염정+탐랑": "넘치는 매력, 뜨거운 도전 정신",
  "염정+칠살": "독보적인 강인함, 타협 없는 집중력",
  "염정+파군": "혁명적인 변화를 이끄는 선봉장",
  "천동+태음": "온화하고 감성적인 복덕형",
  "태양+태음": "활발함과 섬세함을 함께 가진 균형파",
  "태양+거문": "말과 행동으로 빛을 발산하는 타입",
  "천기+태음": "섬세하고 전략적인 감성 지략가",
  "천기+거문": "날카로운 분석과 말솜씨를 갖춘 타입",
  "천기+천량": "통찰력 있게 사람을 살피는 전략가",
};

// 공궁(주성 없음) 폴백 — 궁명별로 해당 자리의 성격에 맞는 중립적 문구.
const EMPTY_LINE: Record<string, string> = {
  命宮:  "주변의 영향을 폭넓게 받아들이는 유연함",
  兄弟宮:"가까운 인연이 다양하게 힘이 돼요",
  夫妻宮:"인연은 천천히 깊어지는 스타일",
  子女宮:"새 시작마다 자유롭게 개척해요",
  財帛宮:"흐름에 맞춰 재물을 유연하게 운용해요",
  疾厄宮:"몸의 신호를 세심하게 살피면 좋아요",
  遷移宮:"환경의 변화에 쉽게 적응하는 편",
  奴僕宮:"다양한 인연과 넓게 어울리는 편",
  官祿宮:"자리보다 역할로 성과를 만드는 타입",
  田宅宮:"공간보다 관계가 안정의 원천이에요",
  福德宮:"취향이 넓고 다양한 것을 즐겨요",
  父母宮:"윗사람과 유연하게 관계를 맺어요",
};

// 한 줄 요약 생성 — 실제 명반의 주성 기준으로 결정.
function lineFor(cn: string, leadStar?: string, secondStar?: string): string {
  // 1) 두 별 조합
  if (leadStar && secondStar) {
    const key = `${leadStar}+${secondStar}`;
    const revKey = `${secondStar}+${leadStar}`;
    const combo = COMBO_LINE[key] ?? COMBO_LINE[revKey];
    if (combo) return combo;
  }
  // 2) 주성 단독
  if (leadStar) {
    const line = STAR_LINE[leadStar];
    if (line) return line;
  }
  // 3) 공궁 폴백
  return EMPTY_LINE[cn] ?? "";
}
