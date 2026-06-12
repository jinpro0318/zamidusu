'use client';

// AI 응답 텍스트 렌더러 — 마크다운 기호가 섞여 와도 화면에 ** 등이 노출되지 않게 처리.
// 풀 마크다운 파서 대신 AI 응답에 실제로 등장하는 패턴만 가볍게 변환한다.
import { Fragment, type ReactNode } from 'react';

function cleanLine(line: string): string {
  return line
    .replace(/^#{1,6}\s*/, '') // "## 소제목" → "소제목"
    .replace(/^\s*[-*]\s+/, '• '); // "- 항목" / "* 항목" → "• 항목"
}

/** **굵게** 를 <b>로 변환하고 나머지 마크다운 기호를 정리해 렌더 */
export function AiText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((rawLine, li) => {
        const line = cleanLine(rawLine);
        // **bold** 구간 분리 — 홀수 인덱스가 굵은 텍스트
        const parts = line.split(/\*\*(.+?)\*\*/g);
        const nodes: ReactNode[] = parts.map((p, i) =>
          i % 2 === 1 ? <b key={i}>{p}</b> : <Fragment key={i}>{p.replace(/\*\*/g, '')}</Fragment>,
        );
        return (
          <Fragment key={li}>
            {li > 0 && '\n'}
            {nodes}
          </Fragment>
        );
      })}
    </>
  );
}
