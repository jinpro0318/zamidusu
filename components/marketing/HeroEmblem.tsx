// 자미두수 프로토타입 메인 화면 SVG를 픽셀 동일하게 재현.
// 원본: /Users/admin/Desktop/자미두수 프로토타입 (오프라인).html
// viewBox 1200x800, 원 (600, 360, r=150), "命" 150px, "자미두수" 58px, "紫微斗數" 26px.

export function HeroEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="자미두수 · 紫微斗數"
      className={className}
    >
      <defs>
        <radialGradient id="hero-orb" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#5E47A0" />
          <stop offset="100%" stopColor="#241A3D" />
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill="#15102a" />

      {/* 메인 명반 원 */}
      <circle
        cx="600"
        cy="360"
        r="150"
        fill="url(#hero-orb)"
        stroke="#E3C36B"
        strokeWidth="3"
      />

      {/* 중앙 한자 "命" */}
      <text
        x="600"
        y="360"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize="150"
        fontWeight="700"
        fill="#E3C36B"
      >
        命
      </text>

      {/* "자미두수" 한글 */}
      <text
        x="600"
        y="585"
        textAnchor="middle"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize="58"
        fontWeight="800"
        fill="#FBF8F3"
        letterSpacing="4"
      >
        자미두수
      </text>

      {/* "紫微斗數" 한자 부제 */}
      <text
        x="600"
        y="650"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="26"
        fill="#B7A4E0"
        letterSpacing="6"
      >
        紫微斗數
      </text>
    </svg>
  );
}

// 페이지마다 다른 한자 모티프를 쓸 수 있는 일반화 버전
export function Emblem({
  glyph,
  title,
  subtitle,
  className,
}: {
  glyph: string; // 큰 한자 (예: 合, 大運, 我)
  title: string; // 한글 제목
  subtitle?: string; // 한자/영문 부제
  className?: string;
}) {
  return (
    <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <radialGradient id="emb-orb" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#5E47A0" />
          <stop offset="100%" stopColor="#241A3D" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="#15102a" />
      <circle cx="600" cy="360" r="150" fill="url(#emb-orb)" stroke="#E3C36B" strokeWidth="3" />
      <text
        x="600"
        y="360"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize={glyph.length === 1 ? "150" : glyph.length === 2 ? "100" : "70"}
        fontWeight="700"
        fill="#E3C36B"
      >
        {glyph}
      </text>
      <text
        x="600"
        y="585"
        textAnchor="middle"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize="58"
        fontWeight="800"
        fill="#FBF8F3"
        letterSpacing="4"
      >
        {title}
      </text>
      {subtitle && (
        <text
          x="600"
          y="650"
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="26"
          fill="#B7A4E0"
          letterSpacing="6"
        >
          {subtitle}
        </text>
      )}
    </svg>
  );
}
