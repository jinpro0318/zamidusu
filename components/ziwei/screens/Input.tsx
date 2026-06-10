'use client';

// screens/Input.tsx — birth info form
import { useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { PrimaryBtn, Seg } from '@/components/ziwei/atoms';
import { BackBar, Label, TextInput, TapField, PickerSheet } from '@/components/ziwei/common';
import type { Nav } from '@/lib/ziwei-types';
import { toast } from 'sonner';

interface PickerCfg {
  title: string;
  options: string[];
  value: string;
  set: (v: string) => void;
}

export function Input({ nav }: { nav: Nav }) {
  const TIMES = [
    '子時 (23:00~01:00)',
    '丑時 (01:00~03:00)',
    '寅時 (03:00~05:00)',
    '卯時 (05:00~07:00)',
    '辰時 (07:00~09:00)',
    '巳時 (09:00~11:00)',
    '午時 (11:00~13:00)',
    '未時 (13:00~15:00)',
    '申時 (15:00~17:00)',
    '酉時 (17:00~19:00)',
    '戌時 (19:00~21:00)',
    '亥時 (21:00~23:00)',
    '태어난 시간 모름',
  ];
  const YEARS: string[] = [];
  for (let y = 2012; y >= 1950; y--) YEARS.push(y + '년');
  const MONTHS: string[] = [];
  for (let m = 1; m <= 12; m++) MONTHS.push(m + '월');
  const DAYS: string[] = [];
  for (let d = 1; d <= 31; d++) DAYS.push(d + '일');

  const [cal, setCal] = useState('양력');
  const [sex, setSex] = useState('');
  const [yy, setYy] = useState('1990년');
  const [mm, setMm] = useState('5월');
  const [dd, setDd] = useState('20일');
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
        const msg = data?.error ?? `명반 생성 실패 (HTTP ${res.status})`;
        throw new Error(msg);
      }
      if (!data?.id) {
        throw new Error('명반 생성 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.');
      }

      // 이동에 성공하면 submitting 해제는 페이지 언마운트가 처리.
      shouldReleaseSubmitting = false;
      nav.reset('result');
      window.location.assign(`/chart/${data.id}`);
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
          <TapField ph="시진을 선택하세요" onClick={() => openPicker('태어난 시간 (12시진)', TIMES, time, setTime)}>
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

// 한국 표준시 hour(0-23). 23시는 자시 = 같은 시진.
function timeToHour(time: string): number {
  if (!time || time.includes('모름')) return 12; // 시 모름 → 정오로 가정
  const map: Record<string, number> = {
    '子': 23, '丑': 1, '寅': 3, '卯': 5, '辰': 7, '巳': 9,
    '午': 11, '未': 13, '申': 15, '酉': 17, '戌': 19, '亥': 21,
  };
  const ch = time[0];
  return map[ch] ?? 12;
}