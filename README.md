# zamidusu — 자미두수 풀스택 MVP

> 1초 만에 만드는 나의 자미두수 명반. AI 챗봇 해석 · 궁합 분석 · 대운 타임라인.
> 한국 최초의 자미두수 단일 특화 + 모던 UX 운명분석 웹서비스.

전체 기획·시장 분석·수익화 전략은 **[`mvp.md`](./mvp.md)**를 참고하세요.

---

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install      # 또는 npm install / yarn

# 2. 환경 변수
cp .env.example .env.local
# .env.local 열어서 NEXTAUTH_SECRET, KAKAO_*, TOSS_*, AI_GATEWAY_API_KEY 채우기

# 3. 데이터베이스 (SQLite, 개발)
pnpm prisma generate
pnpm prisma migrate dev --name init

# 4. 개발 서버
pnpm dev
```

브라우저에서 http://localhost:3000 접속.

---

## 기술 스택

- **Next.js 16** App Router + React 19 + TypeScript 5
- **shadcn/ui** + **Tailwind v4** + 자색·금색 디자인 토큰
- **Prisma 6** + SQLite (dev) / **Neon Postgres** (prod)
- **NextAuth.js v5** + Kakao OAuth + Email magic link
- **Toss Payments SDK v2** + Vercel Cron (정기결제)
- **Vercel AI Gateway** + AI SDK v6 (Claude Haiku/Sonnet/Opus)
- **iztro v2.5.8** — 자미두수 명반 계산 (12궁·14주성·사화·대운·유년)
- **@vercel/og** — 공유 카드 동적 생성
- **Recharts** — 대운/유년 인터랙티브 타임라인

---

## 4대 차별점

| # | 기능 | 위치 |
|---|---|---|
| 1 | AI 명반 해석 챗봇 | `app/chart/[id]/ai`, `app/api/ai/chat/route.ts` |
| 2 | 자미두수 궁합 분석 | `app/compatibility`, `lib/iztro/compatibility.ts` |
| 3 | 인스타·카톡 공유 카드 | `components/share/ShareButton.tsx`, `app/api/og/chart/[id]/route.tsx` |
| 4 | 대운/유년 타임라인 | `app/chart/[id]/timeline`, `components/timeline/DecadalTimeline.tsx` |

---

## 가격 정책

- **무료**: 명반 3개, AI 5턴/일 (Haiku)
- **건당 프리미엄 해석**: 9,900원 (단건, 7일 환불)
- **PREMIUM 월구독**: 9,900원/월 (명반 무제한, AI 50턴/일 Sonnet)
- **PRO 월구독**: 19,900원/월 (AI 200턴/일 Opus, 궁합 무제한)
- 연구독 -20%

전체 가격 카탈로그: `lib/payments/pricing.ts`.

---

## 핵심 디렉토리

```
app/                  # App Router 페이지·API
  api/                # REST 핸들러
  chart/[id]/         # 명반 결과·AI·타임라인·프리미엄
  compatibility/      # 궁합 분석
  share/[token]/      # 공개 공유 페이지
  pricing/            # 가격
  mypage/             # 마이페이지
components/           # UI (shadcn 스타일 + 도메인)
  chart/              # ChartGrid · PalaceCard · StarChip
  timeline/           # DecadalTimeline (Recharts)
  ai/                 # ChatPanel
  share/              # ShareButton (Kakao SDK)
lib/                  # 비즈니스 로직
  iztro/              # 명반 계산 · 직렬화 · 궁합 알고리즘
  ai/                 # 프롬프트 빌더 · 모델 선택 · 가드레일
  payments/           # Toss 래퍼 · 가격 카탈로그
  auth.ts             # NextAuth v5
  db.ts               # Prisma client
  entitlements.ts     # 플랜 게이팅
prisma/schema.prisma  # 데이터 모델
tests/                # vitest 테스트
```

---

## 테스트

```bash
pnpm test
```

iztro 회귀 케이스: `tests/iztro.spec.ts` — 알려진 입력으로 12궁 개수·핵심 필드 검증.

---

## 배포 (Vercel)

이 프로젝트는 **Postgres**를 사용합니다 (Vercel serverless는 SQLite 파일 쓰기를 못 함).

1. **DB 준비** — 둘 중 하나
   - **Supabase Postgres** (인증과 같은 프로젝트 재활용 권장): Dashboard → Settings → Database → Connection string → URI
   - **Neon Postgres** (Vercel Marketplace): Vercel 대시보드 → Storage → Neon 추가 → `DATABASE_URL` 자동 주입
2. **Vercel 환경변수 등록** (Project → Settings → Environment Variables)
   - `DATABASE_URL` (위에서 받은 Postgres URL)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (배포 URL)
   - (선택) `NEXT_PUBLIC_KAKAO_JS_KEY`, `SHARE_TOKEN_SECRET`
3. **스키마 푸시** (로컬에서 1회만)
   ```bash
   # 같은 DATABASE_URL을 로컬 .env에 설정한 뒤
   npx prisma migrate dev --name init
   # 또는 마이그레이션 파일 없이 바로 푸시
   npx prisma db push
   ```
4. **푸시**: `git push origin main` → Vercel 자동 빌드·배포

> `vercel.json`의 빌드 단계는 `prisma generate && next build`로 단순화돼 있어 `DATABASE_URL`이 빌드에 영향을 주지 않습니다. DB 마이그레이션은 위 3단계처럼 로컬에서 한 번만 실행하면 됩니다.

---

## 디스클로저

본 서비스는 오픈소스 [iztro](https://github.com/SylarLong/iztro) 엔진을 사용하며, 학파에 따라 해석 차이가 있을 수 있습니다. 자미두수는 오락·문화적 목적으로 제공되며, 인생의 중대한 결정은 전문가와 상담해 주세요.
