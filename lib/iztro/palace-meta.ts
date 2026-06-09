// 12궁(宮)별 시각·의미 메타. 이름 부분 일치로 매핑(예: "명궁" → 명).
// 아이콘은 lucide-react 키. 설명은 한 줄 요약 (UI 카드 hint용).

import {
  Star,
  Users,
  Heart,
  Baby,
  Wallet,
  HeartPulse,
  Plane,
  UserPlus,
  Briefcase,
  Home,
  Sparkles,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface PalaceMeta {
  key: string;
  icon: LucideIcon;
  emoji: string;
  shortName: string;
  longName: string;
  description: string;
}

const META: PalaceMeta[] = [
  { key: "명", icon: Star, emoji: "⭐", shortName: "명궁", longName: "命宮", description: "자아·기질·운명의 출발점" },
  { key: "형제", icon: Users, emoji: "👬", shortName: "형제", longName: "兄弟宮", description: "형제·동료·인적 네트워크" },
  { key: "부처", icon: Heart, emoji: "💞", shortName: "부처", longName: "夫妻宮", description: "배우자·연애 경향" },
  { key: "자녀", icon: Baby, emoji: "🧒", shortName: "자녀", longName: "子女宮", description: "자식·창작·후계" },
  { key: "재백", icon: Wallet, emoji: "💰", shortName: "재백", longName: "財帛宮", description: "재물·수입 흐름" },
  { key: "질액", icon: HeartPulse, emoji: "🩺", shortName: "질액", longName: "疾厄宮", description: "건강·체질·재난" },
  { key: "천이", icon: Plane, emoji: "🧳", shortName: "천이", longName: "遷移宮", description: "이동·해외·환경 변화" },
  { key: "교우", icon: UserPlus, emoji: "🤝", shortName: "교우", longName: "交友宮", description: "직장 동료·부하·친구" },
  { key: "관록", icon: Briefcase, emoji: "💼", shortName: "관록", longName: "官祿宮", description: "직업·성취·명예" },
  { key: "전택", icon: Home, emoji: "🏠", shortName: "전택", longName: "田宅宮", description: "부동산·집안·유산" },
  { key: "복덕", icon: Sparkles, emoji: "🕊️", shortName: "복덕", longName: "福德宮", description: "정신·취향·복록" },
  { key: "부모", icon: UserCog, emoji: "👨‍👩‍👧", shortName: "부모", longName: "父母宮", description: "부모·윗사람·학업" },
];

export function metaFor(palaceName: string): PalaceMeta {
  for (const m of META) {
    if (palaceName.includes(m.key)) return m;
  }
  // fallback
  return { key: "?", icon: Star, emoji: "✦", shortName: palaceName, longName: palaceName, description: "" };
}

export const PALACE_META = META;
