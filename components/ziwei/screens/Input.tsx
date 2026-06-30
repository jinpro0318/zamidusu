'use client';

// screens/Input.tsx — birth info form
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { PrimaryBtn, Seg } from '@/components/ziwei/atoms';
import { BackBar, Label, TextInput, TapField, PickerSheet } from '@/components/ziwei/common';
import { SIJIN_LABELS, timeToHour, mapTimeToSijin } from '@/data/sijin';

const UNKNOWN_TIME_LABEL = '모름 / 시간 미상';
const RELATIONS = ['본인', '가족', '친구·지인', '연인', '기타'] as const;
import type { Nav } from '@/lib/ziwei-types';
import { toast } from 'sonner';

// 12시진 상수·timeToHour는 data/sijin.ts에서 공용으로 가져온다.

interface PickerCfg {
  title: string;
  options: string[];
  value: string;
  set: (v: string) => void;
}

export function Input({ nav }: { nav: Nav }) {
  const router = useRouter();
  // 개인정보 수집·이용 동의(필수) — 명반은 민감한 개인정보라 작성 전 동의를 받는다.
  const [agree, setAgree] = useState(false);
  const YEARS: string[] = [];
  for (let y = 2012; y >= 1950; y--) YEARS.push(y + '년');
  const MONTHS: string[] = [];
  for (let m = 1; m <= 12; m++) MONTHS.push(m + '월');

  const [cal, setCal] = useState('양력');
  const [sex, setSex] = useState('');
  const [yy, setYy] = useState('1990년');
  const [mm, setMm] = useState('5월');
  const [dd, setDd] = useState('20일');

  // 선택한 달력·연도·월에 맞춰 일(day) 옵션을 동적으로 산출.
  //  - 양력: Date 객체로 정확한 말일 계산 (윤년 2월 = 29일)
  //  - 음력: 클라이언트에 음력 변환 라이브러리가 없어 최대치(30)로 보수 처리.
  //    그래도 잘못 고른 경우 서버가 한글 메시지로 안내함.
  const DAYS = useMemo(() => {
    const yearN = parseInt(yy, 10) || 1990;
    const monthN = parseInt(mm, 10) || 1;
    let maxDay: number;
    if (cal === '양력') {
      maxDay = new Date(yearN, monthN, 0).getDate();
    } else {
      maxDay = 30;
    }
    return Array.from({ length: maxDay }, (_, i) => `${i + 1}일`);
  }, [cal, yy, mm]);

  // 달력/월 변경으로 현재 선택한 일자가 범위를 벗어나면 말일로 보정.
  useEffect(() => {
    const ddN = parseInt(dd, 10);
    const maxDay = DAYS.length;
    if (ddN > maxDay) setDd(`${maxDay}일`);
  }, [DAYS, dd]);
  const [time, setTime] = useState('');
  const [exactTime, setExactTime] = useState(''); // "HH:MM" 직접 입력(선택)
  const [estimated, setEstimated] = useState(false); // 시간이 정확하지 않음(추정)
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<string>('본인');
  const [picker, setPicker] = useState<PickerCfg | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 정확 시각 입력 → 30분 보정 시진 자동 매핑(+경계 안내). 시진을 자동 선택한다.
  const exactMapped = useMemo(() => {
    const mt = exactTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!mt) return null;
    const h = parseInt(mt[1], 10), mi = parseInt(mt[2], 10);
    if (h > 23 || mi > 59) return null;
    return mapTimeToSijin(h, mi);
  }, [exactTime]);
  useEffect(() => {
    if (exactMapped) setTime(exactMapped.label);
  }, [exactMapped]);

  // 출생 시간 불확실: '모름' 선택 또는 '추정' 체크.
  const timeUncertain = time === UNKNOWN_TIME_LABEL || estimated;

  const openPicker = (title: string, options: string[], value: string, set: (v: string) => void) =>
    setPicker({ title, options, value, set });
  const ready = sex && time && agree && !submitting;

  async function submitChart() {
    if (!ready) return;
    setSubmitting(true);
    let shouldReleaseSubmitting = true;
    try {
      const year = parseInt(yy, 10);
      const month = parseInt(mm, 10);
      const day = parseInt(dd, 10);
      const hour = timeToHour(time);
      const isLeapMonth = cal === '음력(윤달)';
      const calendar = cal.startsWith('음력') ? 'LUNAR' : 'SOLAR';
      const gender = sex === '남성' ? 'MALE' : 'FEMALE';

      const res = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: name || undefined,
          gender, calendar,
          year, month, day, hour, minute: 0,
          isLeapMonth,
          timeUncertain,
          relation,
        }),
      });

      // 서버가 본문 없이 죽는 경우(HTML 5xx 등)에도 res.json()으로 터지지 않게 방어.
      const raw = await res.text();
      const data = raw ? safeParseJSON(raw) : null;

      if (!res.ok) {
        // 서버가 노출 허용한 일반화된 메시지만 사용. 내부 detail/stack은 절대 표시하지 않음.
        throw new Error(data?.error ?? '명반 생성에 실패했어요. 잠시 후 다시 시도해 주세요.');
      }
      if (!data?.id) {
        throw new Error('명반 생성 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.');
      }

      // 이동에 성공하면 submitting 해제는 페이지 언마운트가 처리.
      // nav.reset 호출 금지: useNav에 chartId가 없어 routeFor가 "/"로 폴백,
      // 아래 이동과 경합해 결과 페이지에서 홈으로 튕기는 버그가 있었음.
      shouldReleaseSubmitting = false;
      router.push(`/chart/${data.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? '명반 생성 실패');
    } finally {
      if (shouldReleaseSubmitting) setSubmitting(false);
    }
  }

  return (
    // 모바일 하단 잘림 방지:
    //   - minHeight 100vh (fallback) + height 100dvh: 정확히 viewport 높이를 잡아
    //     내부 flex:1 + overflow-y:auto 가 동작하도록 한다
    //   - 본문은 내부 스크롤, CTA는 sticky bottom 으로 항상 노출
    <div
      style={{
        background: Z.cream,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '100%',
        height: '100%',
      }}
    >
      <BackBar nav={nav} />
      <div style={{ padding: '0 22px 6px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 3, background: i < 2 ? Z.p600 : Z.line }} />
          ))}
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: Z.ink, margin: '0 0 6px' }}>출생정보를 알려주세요</h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: Z.ink2, margin: '0 0 22px' }}>정확할수록 명반이 정밀해져요</p>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '0 22px calc(140px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div>
          <Label req>달력 유형</Label>
          <Seg options={['양력', '음력', '음력(윤달)']} value={cal} onChange={setCal} />
        </div>
        <div>
          <Label req>생년월일</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            <TapField flex={1.2} onClick={() => openPicker('태어난 해', YEARS, yy, setYy)}>
              {yy}
            </TapField>
            <TapField flex={1} onClick={() => openPicker('태어난 달', MONTHS, mm, setMm)}>
              {mm}
            </TapField>
            <TapField flex={1} onClick={() => openPicker('태어난 날', DAYS, dd, setDd)}>
              {dd}
            </TapField>
          </div>
        </div>
        <div>
          <Label req>태어난 시간</Label>
          <TapField ph="시진을 선택하세요" onClick={() => openPicker('태어난 시간 (12시진)', SIJIN_LABELS, time, setTime)}>
            {time}
          </TapField>

          {/* 정확한 시각 직접 입력(선택) — 입력 시 시진 자동 매핑 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink3, flexShrink: 0 }}>또는 정확한 시각</span>
            <input
              type="time"
              value={exactTime}
              onChange={(e) => setExactTime(e.target.value)}
              aria-label="정확한 시각 직접 입력 (선택)"
              style={{
                flex: 1, boxSizing: 'border-box', background: Z.white,
                border: `1.5px solid ${Z.line}`, borderRadius: 11, padding: '9px 11px',
                fontFamily: SANS, fontSize: 15, color: Z.ink, outline: 'none',
              }}
            />
          </div>
          {exactMapped && (
            <p style={{ fontFamily: SANS, fontSize: 12, color: exactMapped.nearBoundary ? '#9A5B5B' : Z.p600, margin: '6px 2px 0', lineHeight: 1.5 }}>
              → {exactMapped.label.split(' ')[0]}으로 분석돼요{exactMapped.note ? ` · ${exactMapped.note}` : ''}
            </p>
          )}

          {/* 추정/모름 표시 */}
          <button
            type="button"
            onClick={() => setEstimated((v) => !v)}
            aria-pressed={estimated}
            style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              background: 'transparent', border: 'none', padding: 0,
              fontFamily: SANS, fontSize: 13, color: Z.ink2,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${estimated ? Z.p600 : Z.line}`,
                background: estimated ? Z.p600 : Z.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {estimated && (
                <svg width="11" height="11" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </span>
            시간이 정확하지 않아요 (추정)
          </button>
        </div>
        <div>
          <Label req>성별</Label>
          <div style={{ display: 'flex', gap: 10 }}>
            {['남성', '여성'].map((s) => {
              const on = s === sex;
              return (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    padding: '15px 0',
                    borderRadius: 14,
                    fontFamily: SANS,
                    fontSize: 16,
                    fontWeight: on ? 700 : 500,
                    color: on ? '#fff' : Z.ink2,
                    background: on ? `linear-gradient(180deg,${Z.p600},${Z.p700})` : Z.white,
                    border: on ? 'none' : `1.5px solid ${Z.line}`,
                    boxShadow: on ? '0 6px 16px rgba(76,58,124,0.28)' : 'none',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink3, margin: '8px 2px 0' }}>성별은 대운(大運)의 진행 방향에 영향을 줍니다</p>
        </div>
        <div>
          <Label>
            이름 · 별칭 <span style={{ color: Z.ink3, fontWeight: 400 }}>(선택)</span>
          </Label>
          <TextInput value={name} onChange={setName} ph="저장할 때 표시할 이름" />
        </div>
        <div>
          <Label>
            관계 <span style={{ color: Z.ink3, fontWeight: 400 }}>(선택 · 저장 분류용)</span>
          </Label>
          <Seg options={[...RELATIONS]} value={relation} onChange={setRelation} />
        </div>
      </div>
      {/* sticky bottom CTA: 본문이 스크롤돼도 항상 노출, iOS 홈인디케이터 safe-area 반영 */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          flexShrink: 0,
          padding: '14px 22px max(20px, env(safe-area-inset-bottom))',
          background: `linear-gradient(to top, ${Z.cream} 72%, transparent)`,
        }}
      >
        <button
          type="button"
          onClick={() => setAgree((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            width: '100%',
            marginBottom: 12,
            padding: 0,
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 20,
              height: 20,
              marginTop: 1,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: agree ? Z.p600 : Z.white,
              border: agree ? 'none' : `1.5px solid ${Z.line}`,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {agree ? '✓' : ''}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, lineHeight: 1.5 }}>
            <b style={{ color: Z.ink }}>(필수)</b> 생년월일·태어난 시간·성별 등 개인정보의 수집·이용에 동의합니다. 입력 정보는 명반 계산과 풀이 제공에만 사용돼요.
          </span>
        </button>
        <PrimaryBtn onClick={submitChart} style={{ opacity: ready ? 1 : 0.5 }}>
          {submitting
            ? '명반 계산 중…'
            : !sex || !time
              ? '시간 · 성별을 입력해 주세요'
              : !agree
                ? '개인정보 동의가 필요해요'
                : '명반 생성하기'}
        </PrimaryBtn>
      </div>
      <PickerSheet
        open={!!picker}
        title={picker?.title}
        options={picker?.options || []}
        value={picker?.value}
        onPick={(o) => picker?.set(o)}
        onClose={() => setPicker(null)}
      />
    </div>
  );
}

function safeParseJSON(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}