'use client';

// components/support/SupportWidget.tsx — 고객센터(의견 보내기).
// 플로팅 💬 버튼 → 화면 중앙 팝업 폼 → 제출 시 완료 화면.
// 다른 화면(마이페이지 메뉴 등)에서 window 이벤트 'open-support'로도 열 수 있음.
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatText } from '@phosphor-icons/react';
import { Z, SERIF, SANS } from '@/theme/tokens';
import { useHideOnScrollDown } from '@/hooks/useHideOnScrollDown';

const TYPES = ['문의', '버그 신고', '기능 제안', '기타'] as const;

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [type, setType] = useState<string>(TYPES[0]);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 플로팅 버튼은 "내 명반 차트 페이지(/chart/[id] 및 하위)"에서만 노출.
  // 홈('/')·입력('/chart/new')·기타 경로에서는 버튼을 숨긴다.
  // ⚠️ 위젯(모달 + 'open-support' 리스너)은 전역 마운트를 유지한다.
  //    마이페이지 '고객센터' 메뉴가 window 'open-support' 이벤트로 이 모달을 열기 때문.
  const pathname = usePathname();
  const isChartPage = (() => {
    const seg = (pathname ?? '').split('/'); // ['', 'chart', '<id>', ...]
    return seg[1] === 'chart' && !!seg[2] && seg[2] !== 'new';
  })();

  // 스크롤 다운 시 숨김 / 업 시 노출.
  // 이 페이지는 window가 아니라 안쪽 컨테이너(layout.tsx의 [data-scroll-root])가 스크롤되므로
  // 해당 요소를 찾아 ref에 채운 뒤 useHideOnScrollDown에 전달한다.
  // ⚠️ 이 effect는 아래 useHideOnScrollDown(=내부 effect) 호출보다 먼저 선언되어야 한다.
  //    마운트 시 effect가 선언 순서대로 실행되어, 훅이 리스너를 붙이기 전에 ref.current가 채워진다.
  const scrollRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    scrollRef.current = document.querySelector<HTMLElement>('[data-scroll-root]');
  }, []);
  const hidden = useHideOnScrollDown(scrollRef, 80);

  // prefers-reduced-motion이 켜져 있으면 트랜지션 없이 처리
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // 외부(마이페이지 '고객센터' 메뉴 등)에서 열기
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-support', handler);
    return () => window.removeEventListener('open-support', handler);
  }, []);

  const close = () => {
    setOpen(false);
    // 닫을 때 완료 화면/입력 초기화 (애니메이션 끝난 뒤)
    setTimeout(() => {
      setDone(false);
      setMessage('');
      setEmail('');
      setType(TYPES[0]);
      setErr(null);
    }, 200);
  };

  const submit = async () => {
    if (message.trim().length < 5) {
      setErr('의견 내용을 5자 이상 입력해 주세요.');
      return;
    }
    setSending(true);
    setErr(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('failed');
      setDone(true);
    } catch {
      setErr('전송에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSending(false);
    }
  };

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    fontFamily: SANS, fontSize: 14, color: Z.ink,
    background: Z.white, border: `1.5px solid ${Z.p100}`,
    borderRadius: 12, padding: '11px 13px', outline: 'none',
  };

  return (
    <>
      {/* 플로팅 고객센터 버튼 — 차트 페이지에서만 노출(하단 고정 바 위, 모달 아래).
          작은 원형 아이콘이라 뒤 배경/콘텐츠를 가리지 않음. */}
      {isChartPage && (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="고객센터 · 의견 보내기"
        className={[
          // 트랜지션 (reduced-motion 시 제거)
          reduceMotion ? '' : 'transition-all duration-300 ease-out',
          // 아래로 스크롤 → 화면 밖으로 + 투명 + 클릭 차단 / 위로 → 복귀
          hidden
            ? 'translate-y-[160%] opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100',
        ].join(' ')}
        style={{
          position: 'fixed', right: 16, bottom: 'max(20px, env(safe-area-inset-bottom))',
          zIndex: 130, width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: `linear-gradient(180deg,${Z.p500},${Z.p700})`,
          boxShadow: '0 6px 18px rgba(76,58,124,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* 고객센터(의견 작성) 아이콘 — 글로 문의를 보내는 기능에 맞춰 ChatText 사용.
            기존 흰색·26px·솔리드(fill) 외형 유지. */}
        <ChatText size={26} color="#fff" weight="fill" aria-hidden />
      </button>
      )}

      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(20,14,35,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="의견 보내기"
            style={{
              width: '100%', maxWidth: 360, maxHeight: '86vh', overflowY: 'auto',
              background: Z.cream, borderRadius: 22, boxShadow: '0 18px 60px rgba(0,0,0,0.4)',
              animation: 'modalIn .24s cubic-bezier(.3,.8,.4,1)',
            }}
          >
            <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.94) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

            {/* 헤더 */}
            <div style={{ position: 'relative', padding: '18px 18px 14px', borderBottom: `1px solid ${Z.line}` }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: Z.ink }}>
                {done ? '의견 보내기' : '💬 의견 보내기'}
              </div>
              {!done && (
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: Z.ink2, marginTop: 3 }}>
                  불편한 점·바라는 점을 알려주세요
                </div>
              )}
              <button
                onClick={close}
                aria-label="닫기"
                style={{
                  position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%',
                  border: 'none', background: Z.p50, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 5l14 14M19 5L5 19" stroke={Z.ink2} strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {done ? (
              // ── 완료 화면 ──
              <div style={{ padding: '30px 22px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 44 }}>✅</div>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: Z.ink }}>의견이 접수되었어요</div>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: Z.ink2, textAlign: 'center', lineHeight: 1.6 }}>
                  소중한 의견 고맙습니다.
                  <br />
                  {email ? '회신이 필요하면 입력하신 이메일로 답변드릴게요.' : '더 좋은 서비스로 보답할게요.'}
                </div>
                <button
                  onClick={close}
                  style={{
                    marginTop: 6, width: '100%', cursor: 'pointer', border: 'none', borderRadius: 14, padding: '13px',
                    fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#fff',
                    background: `linear-gradient(180deg,${Z.p600},${Z.p700})`,
                  }}
                >
                  닫기
                </button>
              </div>
            ) : (
              // ── 입력 폼 ──
              <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.ink }}>문의 유형</span>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={fieldStyle}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.ink }}>의견 내용</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="자세히 적어주실수록 빠르게 도와드릴 수 있어요."
                    rows={5}
                    style={{ ...fieldStyle, resize: 'vertical', minHeight: 110, lineHeight: 1.5 }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: Z.ink }}>
                    회신 이메일 <span style={{ color: Z.ink3, fontWeight: 500 }}>(선택)</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={fieldStyle}
                  />
                </label>

                {err && <div style={{ fontFamily: SANS, fontSize: 12.5, color: '#C0463F' }}>{err}</div>}

                <button
                  onClick={submit}
                  disabled={sending}
                  style={{
                    marginTop: 2, width: '100%', cursor: sending ? 'default' : 'pointer',
                    border: 'none', borderRadius: 14, padding: '14px',
                    fontFamily: SANS, fontSize: 15.5, fontWeight: 800, color: '#fff',
                    background: sending ? Z.ink3 : `linear-gradient(180deg,${Z.p600},${Z.p700})`,
                    boxShadow: '0 6px 18px rgba(76,58,124,0.3)',
                  }}
                >
                  {sending ? '보내는 중…' : '보내기'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
