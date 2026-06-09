// 프로토타입 (자미두수 프로토타입.html)의 메인 시그니처:
// radial gradient 원 + 금색 테두리 + "命" 한자 + "자미두수" + "紫微斗數".
// 모바일에서는 viewBox 기반으로 자연스럽게 축소.

export function HeroEmblem({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 720"
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
        <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 12궁 12지(地支) 마이크로 도트 — 원 둘레에 등간격 12개 */}
      <g opacity="0.55">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const r = 220;
          const cx = 300 + Math.cos(angle) * r;
          const cy = 300 + Math.sin(angle) * r;
          return <circle key={i} cx={cx} cy={cy} r="3" fill="#E3C36B" />;
        })}
      </g>

      {/* 메인 명반 원 — 프로토타입의 핵심 모티프 */}
      <circle
        cx="300"
        cy="300"
        r="150"
        fill="url(#hero-orb)"
        stroke="#E3C36B"
        strokeWidth="3"
        filter="url(#gold-glow)"
      />

      {/* 보조 동심원 — 별자리 궤도 느낌 */}
      <circle cx="300" cy="300" r="170" fill="none" stroke="#E3C36B" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="300" cy="300" r="195" fill="none" stroke="#E3C36B" strokeOpacity="0.12" strokeWidth="1" />

      {/* 중앙 한자 命 */}
      <text
        x="300"
        y="300"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize="150"
        fontWeight="700"
        fill="#E3C36B"
      >
        命
      </text>

      {/* 한글 제목 자미두수 */}
      <text
        x="300"
        y="565"
        textAnchor="middle"
        fontFamily="'Nanum Myeongjo', serif"
        fontSize="58"
        fontWeight="800"
        fill="#FBF8F3"
        letterSpacing="4"
      >
        자미두수
      </text>

      {/* 한자 부제 紫微斗數 */}
      <text
        x="300"
        y="625"
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
