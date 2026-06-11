import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (구 PPR) — Next 16에서 활성화하려면 cacheComponents: true.
  // 일부 페이지가 서버 데이터에 의존하므로 일단 비활성. 추후 use cache 적용 후 켜기.
  // cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  transpilePackages: ["iztro", "lunar-typescript"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 공유 페이지(/share)는 외부 임베드가 필요 없으므로 전체 클릭재킹 차단
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
