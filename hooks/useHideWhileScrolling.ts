// hooks/useHideWhileScrolling.ts
// 안쪽 스크롤 컨테이너(window 아님)에서 "스크롤 중 = 숨김 / 멈추면(idle) = 다시 표시" 상태를 계산.
// 디바운스: 스크롤 이벤트가 올 때마다 hidden=true + 타이머 리셋, 마지막 스크롤 후 idleMs 지나면 hidden=false.
// 방향과 무관(다운/업 모두 숨김)하며, 멈추면 항상 다시 보이므로 "마지막엔 늘 보이는 상태"가 보장된다.
import { useEffect, useState, type RefObject } from 'react';

export function useHideWhileScrolling(
  scrollRef: RefObject<HTMLElement | null>,
  idleMs = 150,
): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      setHidden(true); // 스크롤 중 = 숨김 (값이 같으면 React가 no-op 처리)
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setHidden(false), idleMs); // 멈추면 다시 표시
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [scrollRef, idleMs]);

  return hidden;
}
