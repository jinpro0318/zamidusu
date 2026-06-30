// types/index.ts — shared domain + navigation types
import type { BrightnessKey } from '@/theme/tokens';

export type { BrightnessKey };

// app의 명명된 화면 (Next.js 라우트로 1:1 매핑됨)
export type ScreenKey =
  | 'onboarding'
  | 'login'
  | 'input'
  | 'result'
  | 'detail'
  | 'mypage';

// reasons a login gate is raised (drives the gate copy)
export type GateReason = 'ai' | 'save' | 'share' | 'detail';

export interface NavParams {
  /** palace key, e.g. '命宮' — used by the detail screen */
  key?: string;
  [k: string]: unknown;
}

export interface Nav {
  go: (s: ScreenKey, params?: NavParams) => void;
  back: () => void;
  tab: (s: ScreenKey) => void;
  reset: (s: ScreenKey) => void;
  requireLogin: (reason: GateReason, cb?: () => void) => void;
  /** Link href= 용 — Link로 SSR-friendly 이동(접근성/SEO). go와 같은 URL 산출. */
  hrefFor: (s: ScreenKey, params?: NavParams) => string;
}

// one of the 12 palaces / life-areas
export interface Area {
  /** single-hanja glyph used as the circular icon */
  h: string;
  /** plain-Korean life area label */
  ko: string;
  /** classical palace name, e.g. '命宮' */
  cn: string;
  /** grid column (1–4) on the 4×4 plate */
  c: number;
  /** grid row (1–4) on the 4×4 plate */
  r: number;
  /** major stars (主星) seated in this palace, hanja */
  stars: string[];
  /** auxiliary stars (보조성: 육길·육살·주요 잡성), Korean names */
  subStars?: string[];
  /** brightness of the lead star */
  br: BrightnessKey;
  /** one-line plain-Korean summary */
  line: string;
  /** true for the user's own 命宮 (selected) */
  sel?: boolean;
}

export interface AreaDetail {
  /** 한 줄 요약 — 동적(area.line)으로 대체. 정적 override가 필요한 경우만 지정 */
  headline?: string;
  /** 무료 "간단 풀이" — 주성 기준 성격/강점/특징 한 문단 (80~120자) */
  summary: string;
  /** 회원 전용 "상세 풀이" — 기질→발현→주의→조언 흐름, 2~4문단 (300~500자) */
  detail: string;
  /** 이 자리가 무엇을 보는 자리인지 한 줄 부가 설명 (선택, 작은 캡션) */
  scope?: string;
}

export interface SuggestedQuestion {
  q: string;
  a: string;
}

// active login gate (or null when closed)
export interface GateState {
  reason: GateReason;
  onSuccess: (() => void) | null;
}
