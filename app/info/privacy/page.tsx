import { SANS, SERIF } from "@/theme/tokens";

export const metadata = { title: "개인정보 처리방침 · 자미두수" };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px", fontFamily: SANS }}>
      <a href="/" style={{ fontSize: 13, color: "#7C5DC7", textDecoration: "none", display: "inline-block", marginBottom: 28 }}>← 홈으로</a>

      <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>개인정보 처리방침</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 40 }}>시행일: 2025년 12월 1일</p>

      {[
        {
          title: "1. 수집하는 개인정보 항목",
          body: `[카카오 로그인 시 수집 항목]\n- 필수: 카카오 계정 ID, 이름(닉네임), 프로필 이미지\n- 선택: 이메일 주소\n\n[서비스 이용 시 자동 수집]\n- 생년월일, 출생시각(명반 생성용)\n- 서비스 이용 기록, 접속 IP, 기기 정보\n\n[비회원(게스트) 이용 시]\n- 쿠키 기반 임시 식별자만 저장 (개인 식별 불가)`,
        },
        {
          title: "2. 개인정보의 수집 및 이용 목적",
          body: `- 서비스 제공 및 회원 관리\n- 명반 데이터 저장 및 AI 해석 서비스 제공\n- 유료 서비스 결제 및 거래 내역 관리\n- 고객 문의 응대 및 서비스 품질 개선\n- 마케팅(별도 동의 시에만)`,
        },
        {
          title: "3. 개인정보의 보유 및 이용 기간",
          body: `- 회원 가입일부터 탈퇴일까지\n- 탈퇴 후 30일 이내 삭제 (단, 관련 법령에 따라 일정 기간 보존)\n\n[관련 법령에 따른 보존]\n- 전자상거래 소비자 보호법: 계약·청약철회 기록 5년, 대금결제 기록 5년\n- 통신비밀보호법: 로그인 기록 3개월`,
        },
        {
          title: "4. 개인정보의 제3자 제공",
          body: `회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다.\n- 이용자가 동의한 경우\n- 법령에 따라 제공이 의무화된 경우`,
        },
        {
          title: "5. 개인정보 처리 위탁",
          body: `[수탁업체 및 위탁 업무]\n- Supabase Inc.: 사용자 인증 및 세션 관리\n- Tosspayments: 결제 처리\n- Google LLC (Gemini AI): AI 텍스트 생성 (명반 해석)\n\n위탁 업체들은 위탁된 업무 범위 내에서만 개인정보를 처리합니다.`,
        },
        {
          title: "6. 쿠키(Cookie) 운용",
          body: `서비스는 비로그인 이용자 식별을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 기능이 제한될 수 있습니다.`,
        },
        {
          title: "7. 이용자의 권리",
          body: `이용자는 언제든지 다음 권리를 행사할 수 있습니다.\n- 개인정보 열람, 정정, 삭제 요청\n- 동의 철회 및 회원 탈퇴\n\n요청은 고객센터(앱 내 1:1 문의)를 통해 접수하며, 10영업일 이내에 처리합니다.`,
        },
        {
          title: "8. 개인정보 보호책임자",
          body: `성명: 김효진\n직책: 대표\n연락처: support@zamidusu.vercel.app`,
        },
      ].map(({ title, body }) => (
        <section key={title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>{title}</h2>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: "#374151", whiteSpace: "pre-line" }}>{body}</p>
        </section>
      ))}
    </main>
  );
}
