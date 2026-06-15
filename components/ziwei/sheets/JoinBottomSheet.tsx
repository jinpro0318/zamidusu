'use client';

// components/sheets/JoinBottomSheet.tsx — 비회원에게 가입 혜택을 보여주는 하단 고정 바텀시트.
// 혜택 항목은 blur 없이 선명하게 노출 (가입 전 동기부여 목적).
import { Z, SERIF, SANS } from '@/theme/tokens';

const BENEFITS: { icon: string; label: string }[] = [
  { icon: '🗂️', label: '12궁 전체 상세 풀이' },
  { icon: '📈', label: '대운·세운 운세 타임라인' },
  { icon: '💞', label: '궁합·인연 분석' },
  { icon: '🔔', label: '월간 운세 알림' },
  { icon: '💾', label: '여러 명반 저장·관리' },
  { icon: '📄', label: 'PDF 리포트 내보내기' },
];

export function JoinBottomSheet({ onJoin, onLogin }: { onJoin: () => void; onLogin: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        // 차트 보드(거의 검은 p900~p800)와 확실히 구분되도록 한 단계 밝은 보라 톤 +
        // 상단 금색 경계선 + 강한 그림자로 떠 있는 카드처럼 분리.
        background: `linear-gradient(180deg, ${Z.p700} 0%, ${Z.p850} 100%)`,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTop: '2px solid rgba(227,195,107,0.45)',
        boxShadow: '0 -16px 46px rgba(0,0,0,0.5)',
        padding: '16px 16px max(16px, env(safe-area-inset-bottom))',
      }}
    >
      {/* 헤드라인 */}
      <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.4 }}>
        🔮 지금 가입하고 내 운명의 전체 풀이를 받아보세요
      </div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 5 }}>
        무료로 가입하고 상세 풀이와 부가 혜택을 받아보세요
      </div>

      {/* 혜택 6가지 카드 — 가로 스크롤로 컴팩트하게, blur 없이 선명 노출 */}
      <div
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0 2px',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}
      >
        {BENEFITS.map((b) => (
          <div
            key={b.label}
            style={{
              flexShrink: 0, width: 96,
              background: 'rgba(0,0,0,0.18)',
              border: '1px solid rgba(227,195,107,0.28)',
              borderRadius: 13, padding: '11px 9px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}
          >
            <span style={{ fontSize: 18 }}>{b.icon}</span>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.92)', lineHeight: 1.35 }}>{b.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onJoin}
        style={{
          width: '100%', marginTop: 12, cursor: 'pointer',
          fontFamily: SANS, fontSize: 15.5, fontWeight: 800, color: Z.ink,
          border: 'none', borderRadius: 15, padding: '14px',
          background: `linear-gradient(180deg,${Z.goldBright},${Z.gold})`,
          boxShadow: '0 6px 18px rgba(199,162,63,0.4)',
        }}
      >
        3초 만에 무료 회원가입
      </button>
      <button
        onClick={onLogin}
        style={{
          width: '100%', marginTop: 9, cursor: 'pointer',
          fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.7)',
          background: 'transparent', border: 'none',
        }}
      >
        이미 계정이 있으신가요? <b style={{ color: Z.goldBright }}>로그인</b>
      </button>
    </div>
  );
}
