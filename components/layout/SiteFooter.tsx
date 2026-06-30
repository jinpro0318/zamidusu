'use client';

// components/layout/SiteFooter.tsx — 전자상거래 사업자 정보 푸터.
// 사업자등록증(간이과세자) 기재사항 기준. 값 수정은 아래 COMPANY 상수만 고치면 된다.
import { SANS } from '@/theme/tokens';

// ── 회사 정보(사업자등록증 기준) ─────────────────────────────────
// ⚠️ 통신판매업 신고번호·고객문의 이메일은 발급/확정되면 아래 값을 교체하세요.
const COMPANY = {
  service: '자미두수',
  name: '이노브(INNOVE)',
  ceo: '김효진',
  bizNo: '333-32-01588',
  // 공정위 사업자정보 공개(통신판매사업자) 확인 링크 — 사업자번호(숫자만).
  bizCheckUrl: 'https://www.ftc.go.kr/bizCommPop.do?wrkr_no=3333201588',
  mailOrderNo: '제2025-서울강남-05413호', // 통신판매업 신고번호
  address: '서울특별시 강남구 영동대로 602, 6층 z226호(삼성동, 삼성동 미켈란107)',
  hours: '평일 10:00 - 18:00 (점심 12:00~13:00 / 주말·공휴일 휴무)',
} as const;

const muted = 'rgba(255,255,255,0.45)';
const faint = 'rgba(255,255,255,0.3)';

export function SiteFooter() {
  const openSupport = () => window.dispatchEvent(new Event('open-support'));

  return (
    <footer
      style={{
        position: 'relative',
        fontFamily: SANS,
        padding: '22px 26px calc(28px + env(safe-area-inset-bottom))',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 고객센터 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>고객센터</span>
        <button
          type="button"
          onClick={openSupport}
          style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '5px 11px', cursor: 'pointer',
          }}
        >
          1:1 문의하기
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: muted, lineHeight: 1.6, margin: '0 0 16px' }}>
        운영시간 {COMPANY.hours}
      </p>

      {/* 사업자 정보 */}
      <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.75 }}>
        <div>
          상호 : {COMPANY.name}
          <span style={{ color: faint }}> | </span>
          대표 : {COMPANY.ceo}
        </div>
        <div>
          사업자등록번호 : {COMPANY.bizNo}
          <span style={{ color: faint }}> | </span>
          <a
            href={COMPANY.bizCheckUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >
            사업자정보 확인
          </a>
        </div>
        <div>통신판매업 신고번호 : {COMPANY.mailOrderNo}</div>
        <div>주소 : {COMPANY.address}</div>
      </div>

      <p style={{ fontSize: 11, color: faint, marginTop: 16 }}>
        © {new Date().getFullYear()} {COMPANY.name}. All Rights Reserved.
      </p>
    </footer>
  );
}
