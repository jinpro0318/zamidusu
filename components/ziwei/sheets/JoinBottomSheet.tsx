'use client';

// components/sheets/JoinBottomSheet.tsx — 비회원 가입 유도 하단 바텀시트(접이식).
// 기본은 얇은 바 한 줄(화면 가림 최소), 탭하면 혜택 카드 + CTA가 펼쳐짐.
// 가시성(visible)은 부모가 제어 — "풀이 섹션" 진입 시 slide-up, X로 닫으면 세션 동안 숨김.
import { useState } from 'react';
import { Z, SERIF, SANS } from '@/theme/tokens';

const BENEFITS: { icon: string; label: string }[] = [
  { icon: '🗂️', label: '12궁 전체 상세 풀이' },
  { icon: '📈', label: '대운·세운 운세 타임라인' },
  { icon: '💞', label: '궁합·인연 분석' },
  { icon: '🔔', label: '월간 운세 알림' },
  { icon: '💾', label: '여러 명반 저장·관리' },
  { icon: '📄', label: 'PDF 리포트 내보내기' },
];

export function JoinBottomSheet({
  visible,
  onJoin,
  onLogin,
  onClose,
}: {
  /** 부모가 제어하는 노출 여부 — true일 때만 slide-up */
  visible: boolean;
  onJoin: () => void;
  onLogin: () => void;
  /** X 버튼: 이 세션 동안 다시 띄우지 않음 */
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        // 차트 보드(거의 검은 p900~p800)와 구분되는 한 단계 밝은 보라 + 금색 상단선 + 강한 그림자.
        background: `linear-gradient(180deg, ${Z.p700} 0%, ${Z.p850} 100%)`,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTop: '2px solid rgba(227,195,107,0.45)',
        boxShadow: '0 -16px 46px rgba(0,0,0,0.5)',
        // 풀이 섹션 진입 시 부드럽게 등장 / 이탈·닫기 시 아래로 퇴장
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.35s cubic-bezier(0.3,0.8,0.4,1)',
        willChange: 'transform',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* 상단 줄: 토글 바(좌, 전체 폭) + 닫기 X(우) */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* 토글 바 — 접힘: 얇은 한 줄 / 펼침: 헤드라인. 탭하면 상태 전환. */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? '가입 안내 접기' : '가입 안내 펼치기'}
          tabIndex={visible ? 0 : -1}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'left',
            padding: expanded
              ? '14px 8px 10px 16px'
              : '13px 8px max(13px, env(safe-area-inset-bottom)) 16px',
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: SERIF,
              fontSize: expanded ? 16 : 14,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: expanded ? 'normal' : 'nowrap',
            }}
          >
            🔮 {expanded ? '지금 가입하고 내 운명의 전체 풀이를 받아보세요' : '무료 가입하고 전체 풀이 받기'}
          </span>
          {/* 접힘=위 화살표(펼치기), 펼침=아래 화살표(접기) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
            <path
              d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
              stroke={Z.goldBright}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {/* 닫기 X — 세션 동안 숨김 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="가입 안내 닫기"
          tabIndex={visible ? 0 : -1}
          style={{
            flexShrink: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '13px 14px 0 6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 5l14 14M19 5L5 19" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 펼침 영역 — 서브카피 + 혜택 카드 + CTA + 로그인 */}
      {expanded && (
        <div style={{ padding: '0 16px max(16px, env(safe-area-inset-bottom))' }}>
          <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: -2 }}>
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
      )}
    </div>
  );
}
