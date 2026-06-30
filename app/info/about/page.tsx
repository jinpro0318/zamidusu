import { SANS, SERIF } from "@/theme/tokens";

export const metadata = { title: "회사소개 · 자미두수" };

const COMPANY = {
  service: "자미두수",
  name: "이노브(INNOVE)",
  ceo: "김효진",
  bizNo: "333-32-01588",
  mailOrderNo: "제2025-서울강남-05413호",
  address: "서울특별시 강남구 영동대로 602, 6층 z226호(삼성동, 삼성동 미켈란107)",
  email: "support@zamidusu.vercel.app",
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px", fontFamily: SANS }}>
      <a href="/" style={{ fontSize: 13, color: "#7C5DC7", textDecoration: "none", display: "inline-block", marginBottom: 28 }}>← 홈으로</a>

      <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>회사소개</h1>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 40 }}>{COMPANY.name}</p>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>서비스 소개</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#374151" }}>
          <b>자미두수(zamidusu)</b>는 동양 전통 명리 체계인 자미두수(紫微斗數)를 누구나 쉽게 접할 수 있도록
          AI 기술과 결합한 운세·명반 서비스입니다. 생년월일시를 입력하면 1초 안에 12궁 명반이 생성되고,
          AI가 각 궁의 주성과 흐름을 실생활 언어로 풀어드립니다.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", marginTop: 12 }}>
          단순한 점술 앱이 아니라, 수십 년의 자미두수 이론을 현대적인 언어로 재해석해
          삶의 흐름을 이해하고 더 나은 선택을 내리도록 돕는 것이 저희의 목표입니다.
        </p>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>사업자 정보</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          {[
            ["상호", COMPANY.name],
            ["대표자", COMPANY.ceo],
            ["사업자등록번호", COMPANY.bizNo],
            ["통신판매업 신고번호", COMPANY.mailOrderNo],
            ["주소", COMPANY.address],
            ["고객문의", COMPANY.email],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #f0eefc" }}>
              <td style={{ padding: "10px 0", color: "#6b7280", width: 140, verticalAlign: "top" }}>{label}</td>
              <td style={{ padding: "10px 0", color: "#1f2937", lineHeight: 1.6 }}>{value}</td>
            </tr>
          ))}
        </table>
      </section>
    </main>
  );
}
