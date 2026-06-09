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
};

export default nextConfig;
