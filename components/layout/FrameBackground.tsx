'use client';

// components/layout/FrameBackground.tsx
// 데스크탑(>480px)에서 480px 칼럼 양옆 여백을 라우트에 맞는 색으로 채워
// 크림 화면 옆에 body 다크 배경이 "어두운 띠"로 노출되는 문제를 없앤다.
// - 크림 화면 라우트면 풀-뷰포트 크림 레이어를 깔아 이음새 제거.
// - 다크 화면(랜딩/sign-in/chart의 ai 등)·미지정 라우트는 null → 기존 body 다크 유지(회귀 0).
// 칼럼은 transform containing block이라 칼럼 내부 fixed로는 여백을 칠할 수 없어, body 레벨에서 처리.
import { usePathname } from 'next/navigation';

export function FrameBackground() {
  const p = usePathname() || '';
  const light =
    /^\/chart\/[^/]+$/.test(p) || // 결과(/chart/[id]) + /chart/new
    /^\/chart\/[^/]+\/(palace|deep|timeline|monthly)/.test(p); // 상세/전체풀이/타임라인/월간
  if (!light) return null;
  return <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#FBF8F3' }} />;
}
