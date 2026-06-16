// theme/tokens.ts — brand tokens for the 자미두수 mobile design
// Single source of truth for color, type, and brightness styling.

export const Z = {
  p900: '#241A3D',
  p850: '#2C2150',
  p800: '#372A60',
  p700: '#4C3A7C',
  p600: '#5E47A0',
  p500: '#7C5DC7',
  p300: '#B7A4E0',
  p100: '#EDE7F8',
  p50: '#F7F4FC',
  gold: '#C7A23F',
  goldBright: '#E3C36B',
  goldSoft: '#F0E3BE',
  ink: '#231B33',
  ink2: '#6B6378',
  ink3: '#9B94A8',
  line: '#ECE7F2',
  cream: '#FBF8F3',
  white: '#FFFFFF',
  kakao: '#FEE500',
} as const;

export const SERIF = "'Nanum Myeongjo', serif";
export const SANS = "'Pretendard', -apple-system, system-ui, sans-serif";

// brightness states of a star within a palace (廟旺平陷)
export type BrightnessKey = '廟' | '旺' | '平' | '陷';

export const BR: Record<BrightnessKey, { bg: string; fg: string; bd: string }> = {
  廟: { bg: 'rgba(199,162,63,0.16)', fg: '#9C7C1E', bd: 'rgba(199,162,63,0.5)' },
  旺: { bg: 'rgba(124,93,199,0.14)', fg: '#5E47A0', bd: 'rgba(124,93,199,0.4)' },
  平: { bg: 'rgba(107,99,120,0.12)', fg: '#6B6378', bd: 'rgba(107,99,120,0.3)' },
  陷: { bg: 'rgba(176,120,120,0.14)', fg: '#9A5B5B', bd: 'rgba(176,120,120,0.35)' },
};

// 묘왕이함(廟旺利陷) — 별의 밝기/기운 세기 등급 설명 (툴팁·aria 라벨에 재사용).
// 키는 등급 한자 원문. 현재 데이터는 廟·旺·平·陷만 쓰지만, 得·利·不 등도 안전하게 커버.
export const BRIGHTNESS_INFO: Record<string, { ko: string; desc: string }> = {
  廟: { ko: '묘(廟)', desc: '가장 강한 기운 — 별의 힘이 최고로 발휘돼요' },
  旺: { ko: '왕(旺)', desc: '왕성한 기운 — 별의 힘이 강하게 드러나요' },
  得: { ko: '득(得)', desc: '기운을 얻은 자리 — 무난히 좋게 작용해요' },
  利: { ko: '이(利)', desc: '이로운 자리 — 비교적 순조롭게 작용해요' },
  平: { ko: '평(平)', desc: '평지 — 무난한 세기로 작용해요' },
  不: { ko: '불(不)', desc: '기운이 약한 편 — 힘을 충분히 내기 어려워요' },
  陷: { ko: '함(陷)', desc: '함지 — 약해진 기운, 조건이 갖춰질 때 빛나요' },
};
