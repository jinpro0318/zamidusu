// data/sijin.ts — 자미두수 정통(중국·대만식) 12시진 상수/헬퍼.
// 입력 화면(Input)·궁합 직접입력 등에서 공용으로 재사용한다.
// - 지방시(진태양시) 보정: 한국 시계는 경도차로 약 30분 빠르므로 시진 경계를 "30분" 단위로 표시.
// - 자시 정자시법: 밤 23:30(한국 시계)부터는 "다음 날 자시"로 본다.
// value는 계산부 분기용 표준 명칭(영문), label은 한국 시계 기준 범위(30분 보정 반영).
export const ZAMI_SIJIN_OPTIONS = [
  { value: 'UNKNOWN', label: '모름 / 시간 미상' },
  { value: 'ZI', label: '자시(子時) 23:30 ~ 01:30 (전날 밤 11시 반부터)' },
  { value: 'CHOU', label: '축시(丑時) 01:30 ~ 03:30' },
  { value: 'YIN', label: '인시(寅時) 03:30 ~ 05:30' },
  { value: 'MAO', label: '묘시(卯時) 05:30 ~ 07:30' },
  { value: 'CHEN', label: '진시(辰時) 07:30 ~ 09:30' },
  { value: 'SI', label: '사시(巳時) 09:30 ~ 11:30' },
  { value: 'WU', label: '오시(午時) 11:30 ~ 13:30' },
  { value: 'WEI', label: '미시(未時) 13:30 ~ 15:30' },
  { value: 'SHEN', label: '신시(申時) 15:30 ~ 17:30' },
  { value: 'YOU', label: '유시(酉時) 17:30 ~ 19:30' },
  { value: 'XU', label: '술시(戌時) 19:30 ~ 21:30' },
  { value: 'HAI', label: '해시(亥時) 21:30 ~ 23:30' },
] as const;

export const SIJIN_LABELS = ZAMI_SIJIN_OPTIONS.map((o) => o.label);

// 시진 표준값 → 한국 표준시 기준 대표 hour(0-23). 엔진은 이 hour로 timeIndex를 산출한다.
// ZI는 23으로 넘겨, generateAstrolabe에서 정자시법(다음 날 자시)으로 처리한다.
const SIJIN_HOUR: Record<string, number> = {
  ZI: 23, CHOU: 1, YIN: 3, MAO: 5, CHEN: 7, SI: 9,
  WU: 11, WEI: 13, SHEN: 15, YOU: 17, XU: 19, HAI: 21,
};

// 선택한 시진 라벨 → 한국 표준시 기준 대표 hour(0-23). 모름/미상은 정오(12).
export function timeToHour(label: string): number {
  const opt = ZAMI_SIJIN_OPTIONS.find((o) => o.label === label);
  if (!opt || opt.value === 'UNKNOWN') return 12;
  return SIJIN_HOUR[opt.value] ?? 12;
}

// 시진 value 순서(자→해). 30분 보정 기준 블록 인덱스 매핑용.
const SIJIN_ORDER = ['ZI', 'CHOU', 'YIN', 'MAO', 'CHEN', 'SI', 'WU', 'WEI', 'SHEN', 'YOU', 'XU', 'HAI'] as const;
const SIJIN_KO: Record<string, string> = {
  ZI: '자시(子時)', CHOU: '축시(丑時)', YIN: '인시(寅時)', MAO: '묘시(卯時)', CHEN: '진시(辰時)', SI: '사시(巳時)',
  WU: '오시(午時)', WEI: '미시(未時)', SHEN: '신시(申時)', YOU: '유시(酉時)', XU: '술시(戌時)', HAI: '해시(亥時)',
};

// 정확한 시각(HH:MM) → 30분 보정 기준 시진 매핑.
// 자시 23:30~01:30 등 경계가 :30이므로 +30분 시프트 후 120분(2시간) 블록으로 나눈다.
export function mapTimeToSijin(h: number, m: number): {
  value: string;
  label: string;
  hour: number;
  nearBoundary: boolean;
  note?: string;
} {
  const shifted = (((h * 60 + m + 30) % 1440) + 1440) % 1440;
  const idx = Math.floor(shifted / 120); // 0=자 … 11=해
  const value = SIJIN_ORDER[idx];
  const label = ZAMI_SIJIN_OPTIONS.find((o) => o.value === value)!.label;
  const off = shifted % 120; // 블록 내 위치(분)
  const nearBoundary = off <= 10 || off >= 110;
  let note: string | undefined;
  if (nearBoundary) {
    const prev = SIJIN_KO[SIJIN_ORDER[(idx + 11) % 12]];
    const next = SIJIN_KO[SIJIN_ORDER[(idx + 1) % 12]];
    const neighbor = off <= 10 ? prev : next;
    note = `입력하신 시각은 ${SIJIN_KO[value]}·${neighbor} 경계에 가까워요. 지방시 보정에 따라 앞뒤 시진일 수 있어요.`;
  }
  return { value, label, hour: SIJIN_HOUR[value], nearBoundary, note };
}
