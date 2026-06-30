import { SANS, SERIF } from "@/theme/tokens";

export const metadata = { title: "이용약관 · 자미두수" };

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px", fontFamily: SANS }}>
      <a href="/" style={{ fontSize: 13, color: "#7C5DC7", textDecoration: "none", display: "inline-block", marginBottom: 28 }}>← 홈으로</a>

      <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>이용약관</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 40 }}>시행일: 2025년 12월 1일</p>

      {[
        {
          title: "제1조 (목적)",
          body: `이 약관은 이노브(INNOVE, 이하 "회사")가 운영하는 자미두수(zamidusu) 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.`,
        },
        {
          title: "제2조 (정의)",
          body: `① "서비스"란 회사가 제공하는 자미두수 명반 생성, AI 해석, 유료 콘텐츠 등 일체의 서비스를 의미합니다.\n② "이용자"란 이 약관에 동의하고 서비스를 이용하는 자를 말합니다.\n③ "회원"이란 카카오 등 소셜 계정으로 로그인하여 서비스를 이용하는 자를 말합니다.`,
        },
        {
          title: "제3조 (약관의 효력 및 변경)",
          body: `① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.\n② 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있으며, 변경 시 최소 7일 전에 공지합니다.`,
        },
        {
          title: "제4조 (서비스의 제공)",
          body: `① 회사는 다음과 같은 서비스를 제공합니다.\n  - 자미두수 명반 자동 생성 서비스 (무료)\n  - AI 기반 궁별 해석 서비스 (일부 무료, 일부 유료)\n  - 재회운 분석, 궁합·인연 분석 등 유료 콘텐츠\n② 회사는 서비스 개선을 위해 내용을 변경할 수 있으며, 유료 서비스의 경우 사전 공지합니다.`,
        },
        {
          title: "제5조 (이용자의 의무)",
          body: `① 이용자는 다음 행위를 하여서는 안 됩니다.\n  - 서비스의 콘텐츠를 무단으로 복제·배포·상업적으로 이용하는 행위\n  - 타인의 정보를 도용하거나 허위 정보를 입력하는 행위\n  - 서비스의 정상적인 운영을 방해하는 행위`,
        },
        {
          title: "제6조 (유료 서비스 및 결제)",
          body: `① 유료 콘텐츠는 토스페이먼츠를 통해 결제됩니다.\n② 결제 완료 즉시 서비스가 제공되며, 디지털 콘텐츠의 특성상 구매 후 환불은 콘텐츠 미이용 시에만 가능합니다.\n③ 이의가 있는 경우 고객센터로 문의해 주세요.`,
        },
        {
          title: "제7조 (면책 조항)",
          body: `① 서비스는 오락·참고 목적으로 제공되며, 의료·법률·투자 등의 전문적 조언을 대체하지 않습니다.\n② 회사는 서비스 이용 결과에 따른 손해에 대해 법령이 허용하는 범위 내에서 책임을 지지 않습니다.`,
        },
        {
          title: "제8조 (분쟁 해결)",
          body: `서비스 이용으로 발생한 분쟁에 대해서는 대한민국 법령을 준거법으로 하며, 회사 소재지 관할 법원을 전속 관할 법원으로 합니다.`,
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
