'use client';

// screens/Input.tsx — birth info form
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { PrimaryBtn, Seg } from '@/components/ziwei/atoms';
import { BackBar, Label, TextInput, TapField, PickerSheet } from '@/components/ziwei/common';
import { SavedChartsSheet } from '@/components/ziwei/SavedChartsSheet';
import { SIJIN_LABELS, timeToHour } from '@/data/sijin';
import type { Nav } from '@/lib/ziwei-types';
import { toast } from 'sonner';

// 12시진 상수·timeToHour는 data/sijin.ts에서 공용으로 가져온다.

interface PickerCfg {
  title: string;
  options: string[];
  value: string;
  set: (v: string) => void;
}

export function Input({ nav, isLoggedIn = false }: { nav: Nav; isLoggedIn?: boolean }) {
  const router = useRouter();
  // 로그인 사용자만: 저장한 명반 불러오기 시트
  const [savedOpen, setSavedOpen] = useState(false);
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
  const [name, setName] = useState('');
  const [picker, setPicker] = useState<PickerCfg | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openPicker = (title: string, options: string[], value: string, set: (v: string) => void) =>
    setPicker({ title, options, value, set });
  const ready = sex && time && !submitting;

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: Z.ink, margin: '0 0 6px' }}>출생정보를 알려주세요</h1>
          {/* 회원만 노출: 저장한 명반을 시트로 불러오기 (비회원은 기존 화면 그대로) */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setSavedOpen(true)}
              aria-label="저장한 내 명반 불러오기"
              style={{
                flexShrink: 0,
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: Z.p600,
                background: Z.p50,
                border: `1.5px solid ${Z.p100}`,
                borderRadius: 18,
                padding: '7px 13px',
                whiteSpace: 'nowrap',
              }}
            >
              📂 내 명반 불러오기
            </button>
          )}
        </div>
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
        <PrimaryBtn onClick={submitChart} style={{ opacity: ready ? 1 : 0.5 }}>
          {submitting ? '명반 계산 중…' : ready ? '명반 생성하기' : '시간 · 성별을 입력해 주세요'}
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
      {isLoggedIn && <SavedChartsSheet open={savedOpen} onClose={() => setSavedOpen(false)} />}
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