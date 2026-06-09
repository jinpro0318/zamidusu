// types/index.ts — shared domain + navigation types
import type { BrightnessKey } from '@/theme/tokens';

export type { BrightnessKey };

// the 8 screens in the prototype flow
export type ScreenKey =
  | 'onboarding'
  | 'login'
  | 'input'
  | 'loading'
  | 'result'
  | 'chart'
  | 'detail'
  | 'mypage';

// reasons a login gate is raised (drives the gate copy)
export type GateReason = 'ai' | 'save' | 'share';

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
  /** stars seated in this palace */
  stars: string[];
  /** brightness of the lead star */
  br: BrightnessKey;
  /** one-line plain-Korean summary */
  line: string;
  /** true for the user's own 命宮 (selected) */
  sel?: boolean;
}

export interface AreaDetail {
  about: string;
  star: string;
  ai: string;
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
