// hooks/useHideOnScrollDown.ts
// 안쪽 스크롤 컨테이너(window 아님)에서 "아래로 스크롤 → 숨김, 위로 스크롤 → 노출" 상태를 계산.
// scroll 이벤트는 requestAnimationFrame으로 스로틀 처리하고,
// 상단 threshold(px) 이내에서는 항상 노출(false)을 반환한다.
import { useEffect, useRef, useState, type RefObject } from 'react';

export function useHideOnScrollDown(
  scrollRef: RefObject<HTMLElement | null>,
  threshold = 80,
): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    lastY.current = el.scrollTop;

    const update = () => {
      const y = el.scrollTop;
      if (y <= threshold) {
        // 상단 threshold 이내에서는 항상 노출
        setHidden(false);
      } else if (y > lastY.current + 4) {
        // 아래로 스크롤 → 숨김
        setHidden(true);
      } else if (y < lastY.current - 4) {
        // 위로 스크롤 → 노출
        setHidden(false);
      }
      lastY.current = y;
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef, threshold]);

  return hidden;
}
