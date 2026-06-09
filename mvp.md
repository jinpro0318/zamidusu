# 자미두수(紫微斗數) MVP 기획서

> **버전**: v1.0 (Next.js 풀스택 MVP)
> **작성일**: 2026-06-09
> **포지션**: 한국 최초의 **자미두수 단일 특화 + AI 해석 + 모던 UX** 운명분석 웹서비스

---

## 1. 한 줄 요약

> "사주 다음은 자미두수." — 1초 만에 만드는 내 명반, AI가 자유롭게 풀이하는 12궁, 인스타로 공유하는 우주.

기획서(`자미두수_MVP_기획문서.docx`)의 명세를 **Next.js 16 풀스택**으로 구현하고,
경쟁(포스텔러·헬로우봇)과 차별화되는 **4가지 핵심 차별점**과 **프리미엄 결제 수익화**를 결합한다.

---

## 2. 시장 진단 — 수익화 가능한 구조인가?

### 2-1. 한국 점술/운세 시장

- 시장 규모: **약 1.4조 원** (2024 한경 산업 추정)
- MZ 1인당 연 운세 지출: **80,300원**
- 포스텔러: 누적 **860만 가입자**, 밸류 350억
- 헬로우봇: 500만 가입자, 사주·타로 종합
- 점치는 청년 시장: 70% 이상이 모바일·앱으로 전환

### 2-2. 자미두수 영역의 공백

| 관점 | 현황 | 시사점 |
|---|---|---|
| 검색량 | "자미두수" 월 5,000+, "자미두수 명반" 1,500+, long-tail까지 합치면 월 15,000+ | **수요는 견고** |
| 한국 자미두수 단일 특화 사이트 | 거의 부재. 대만/홍콩 중국어 사이트, 또는 사주 종합 사이트의 보너스 메뉴 | **카테고리 디자인 기회 (블루오션)** |
| 사용자 페르소나 | 35-55 명리 심화 유저 + 사주에 실증난 MZ + 자미두수 학습자 | **다층 타겟** |

### 2-3. 결론

> 자미두수는 **검색 수요는 있고 공급은 약한** 영역이다.
> 자미두수만 다루는 모던 웹서비스를 만들면 **SEO 트래픽을 거의 독점** 가능하다.
> 수익화는 **프리미엄 해석 결제(건당 + 구독)**로 충분히 가능하다.

---

## 3. 4대 차별점 — 다른 자미두수 사이트와 어떻게 다른가

| # | 차별점 | 경쟁사 현황 | 우리의 구현 | 수익 기여 |
|---|---|---|---|---|
| 1 | **AI 명반 해석 챗봇** | 정적 텍스트만, 또는 GPT-3.5 수준 | Claude Opus 4.7 + 내 명반 컨텍스트 주입 | 프리미엄 전환 핵심 |
| 2 | **궁합 분석 (두 명반 비교)** | 자미두수 궁합은 희소 | 자체 점수 알고리즘 (지지 6합·사화 충돌·오행국 상생) | 커플·소개팅 시장 진입 |
| 3 | **모던 UX + 공유 카드** | 1990년대 디자인 | 자색·금색 톤 + 다크모드 + 인스타·카톡 OG 자동 생성 | 자발적 바이럴 → CAC 절감 |
| 4 | **대운/유년 인터랙티브 타임라인** | 텍스트 나열 | Recharts 그래프 + "2026년의 나" 클릭 → 즉시 해석 | 재방문 후크 |

---

## 4. 가격 정책 (수익 구조)

| 플랜 | 가격 | 포함 내용 |
|---|---|---|
| **무료** | 0원 | 명반 1개 저장, 12궁 기본 해석, AI 챗 일 5턴(Haiku), 공유 카드 |
| **건당 프리미엄 해석** | **9,900원** | 단일 명반의 깊이 해석 PDF + 대운/유년 종합 리포트 + AI 100턴 |
| **PREMIUM 월구독** | **9,900원/월** | 명반 무제한 저장, AI Opus 일 50턴, 모든 명반 프리미엄 자동 unlock |
| **PRO 월구독** | **19,900원/월** | + 궁합 무제한, 우선 지원, 향후 전문가 1:1 |

- 연구독: **−20%** (PREMIUM 95,000원/년, PRO 191,000원/년)
- 단건 결제: 7일 이내 환불 보장 (전자상거래법 준수)
- 결제 수단: **Toss Payments** (한국 사용자 친화적, 카드/계좌/카카오페이/네이버페이)

### 단위경제 (월 10만 방문 가정)

| 단계 | 전환률 | 인원 |
|---|---|---|
| 방문자 | — | 100,000 |
| 가입 | 18% | 18,000 |
| 명반 생성 | 70% | 12,600 |
| AI 챗 사용 | 55% | 6,930 |
| 결제 시도 | 6% | 416 |
| 결제 완료 | 70% | **291건** |

- 평균 객단가: 9,900원 (단건+구독 혼합)
- **월 매출: 약 288만 원**
- 비용: AI 50만 + Vercel/Neon 20만 = 70만 원
- **순익: 약 218만 원/월** (인건비 제외, 마케팅 재투자 가능)

성장 시 (월 1M 방문, 1년 차, 구독 30%): **ARR ₩6억** 도달 가능.

---

## 5. 기술 스택 & 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router) + React 19 + TypeScript 5         │
├──────────────────────────────────┬──────────────────────────┤
│  UI: shadcn/ui + Tailwind v4     │  자색·금색 디자인 토큰    │
│  Auth: NextAuth.js v5 + Kakao    │  Email magic link 폴백   │
│  DB: Prisma 6 + Neon Postgres    │  개발은 SQLite           │
│  명반 엔진: iztro v2.5.8 (ko-KR) │  + lunar-typescript      │
│  AI: Vercel AI Gateway + AI SDK  │  Haiku/Opus 분기         │
│  결제: Toss Payments v2          │  위젯 + 빌링키 + Cron    │
│  공유 카드: @vercel/og           │  ImageResponse 1200×630  │
│  타임라인: Recharts              │  대운/유년 그래프         │
│  배포: Vercel                    │  Marketplace Neon 통합   │
└──────────────────────────────────┴──────────────────────────┘
```

---

## 6. 디렉토리 구조

```
/Users/admin/Desktop/zamidusu/
├─ app/
│  ├─ (marketing)/                 # 공개 페이지
│  │  ├─ page.tsx                  # 랜딩 (/)
│  │  ├─ pricing/page.tsx
│  │  └─ layout.tsx
│  ├─ (auth)/{sign-in,sign-up}/
│  ├─ (app)/                       # 인증 필요
│  │  ├─ chart/new/page.tsx
│  │  ├─ chart/[id]/{page,ai,timeline,premium}/page.tsx
│  │  ├─ compatibility/{page,[id]}/page.tsx
│  │  └─ mypage/page.tsx
│  ├─ share/[token]/page.tsx       # 공개 공유
│  ├─ api/
│  │  ├─ auth/[...nextauth]/route.ts
│  │  ├─ charts/{route,[id]/route,[id]/share/route}.ts
│  │  ├─ compatibility/route.ts
│  │  ├─ ai/chat/route.ts
│  │  ├─ payments/{init,confirm,webhook,subscription}/route.ts
│  │  ├─ og/chart/[id]/route.tsx
│  │  └─ cron/billing/route.ts
│  ├─ layout.tsx · globals.css · robots.ts · sitemap.ts
├─ components/{ui,chart,timeline,ai,compatibility,share,marketing}/
├─ lib/
│  ├─ iztro/{generate,serialize,horoscope,compatibility}.ts
│  ├─ ai/{gateway,prompt-builder,guardrails}.ts
│  ├─ payments/{toss,pricing}.ts
│  └─ {auth,db,entitlements,share-token,utils}.ts
├─ prisma/schema.prisma
├─ public/fonts/
├─ middleware.ts · vercel.json · .env.local
└─ mvp.md (본 문서)
```

---

## 7. 데이터 모델 (Prisma)

핵심 엔티티:

- **User / Account / Session / VerificationToken** — NextAuth v5 표준
- **Chart** — `payload Json`(iztro 전체 산출물 캐시) + `iztroVersion` + `shareToken` + `isPremiumUnlocked`
- **Subscription** — `plan`(FREE/PREMIUM/PRO) + `status` + `tossBillingKey` + `currentPeriodEnd`
- **Payment** — `orderId/paymentKey` unique + `productType` + `productRef`(Chart.id 또는 Subscription.id)
- **AiConversation** — `chartId` 연결 + `messages Json` + `tokenUsage`
- **Compatibility** — `chartA/B` + `score` + `detail Json`

> 기획서 ERD의 `palaces`/`stars` 마스터 테이블은 제거. iztro가 stateless 함수형 라이브러리라 런타임 산출. Chart.payload(Json) 한 컬럼에 캐시.

---

## 8. 차별화 기능 4가지 — 구현 디테일

### 8-1. AI 명반 해석 챗봇

- **파일**: `app/api/ai/chat/route.ts`, `lib/ai/prompt-builder.ts`
- **로직**: Vercel AI SDK `streamText` + AI Gateway
  - 무료: `anthropic/claude-haiku-4.7`
  - PREMIUM/PRO: `anthropic/claude-opus-4.7`
- **시스템 프롬프트**: Chart.payload의 12궁·14주성·사화·신주·오행국을 한국어로 요약 주입
- **가드레일**: 운명론 단정 금지("~할 가능성이 있다"), 의학/법률/금융 거부, 차별 표현 금지
- **레이트 리밋**: Vercel Runtime Cache, 키 `ai:${userId}:${YYYYMMDD}`

### 8-2. 궁합 분석 (자체 알고리즘)

- **파일**: `lib/iztro/compatibility.ts`
- **점수 0-100**, 카테고리: love(0.5)/work(0.3)/family(0.2)
- **룰**:
  - 명궁 지지 6합 → +20, 6충 → −15
  - 부처궁 ↔ 상대 명궁 주성 호환 (자미·천부 +15, 칠살·파군 −5)
  - 사화 화기궁이 상대 명궁이면 −10, 화록궁이면 +15
  - 오행국 상생 +10, 상극 −5

### 8-3. 모던 UX + 공유 카드

- **파일**: `app/api/og/chart/[id]/route.tsx`
- **`@vercel/og`의 `ImageResponse`** — 1200×630 PNG (Edge runtime)
- **디자인**: 자색 그라데이션 + 금색 명궁/주성/오행국 + Nanum Myeongjo
- **카카오 공유**: Kakao JS SDK `Kakao.Share.sendDefault({ objectType: 'feed' })`

### 8-4. 대운/유년 인터랙티브 타임라인

- **파일**: `components/timeline/DecadalTimeline.tsx`
- **Recharts** `LineChart` — x축 10년 구간, y축 길/흉성 합산
- **상호작용**: 점 클릭 → shadcn `<Sheet>` 열려 해당 10년 12궁 + 유년 그리드
- `ReferenceLine` "현재" 표시 → 사용자 즉시 자기 위치 파악

---

## 9. 명반 계산 엔진 — iztro 통합

검증된 오픈소스 자미두수 라이브러리 **iztro v2.5.8** (MIT, TypeScript) 사용.

- 양/음력 자동 변환 (`astrolabeBySolarDate` / `astrolabeByLunarDate`)
- 12궁·14주성·보좌성·잡성·사화 자동 배치
- 대운/유년/유월/유일/유시 `astrolabe.horoscope(date)`
- `"ko-KR"` 로케일 → 궁명·성명 한국어
- 한국 시간 hour(0-23) → iztro `timeIndex`(0-12 시진) 변환 헬퍼

회귀 테스트: `vitest`로 알려진 케이스(2000-08-16 02시 남) 스냅샷 비교.

---

## 10. 인증 & 결제

### 10-1. NextAuth.js v5 + Kakao

- Prisma Adapter (별도 DB 불필요)
- Kakao Developers → Redirect URI `/api/auth/callback/kakao`
- Email magic link (Resend/SMTP)

### 10-2. Toss Payments v2 결제 흐름

1. `POST /api/payments/init` → DB에 `Payment{status:READY, orderId, amount}`
2. 클라이언트 위젯: `loadTossPayments(clientKey).widgets(customerKey).requestPayment(...)`
3. `successUrl=/api/payments/confirm` 콜백 → amount 검증 → Toss confirm 호출 → `status:DONE` + `grantEntitlement()`
4. 웹훅 `/api/payments/webhook` — 멱등성 키 `paymentKey+status`
5. 정기결제: 빌링키 발급 → Vercel Cron `0 3 * * *`

### 10-3. 게이팅 (`lib/entitlements.ts`)

플랜별 `aiTurnsPerDay`/`model`/`compatibility` 한도 단일 진실원.

---

## 11. SEO & 마케팅

### 11-1. 키워드 전략

- **1차 (검색량)**: 자미두수 (5K+), 자미두수 명반 (1.5K), 자미두수 무료 (1.2K), 자미두수 보는법
- **2차 (long-tail, 전환 ↑)**: 자미두수 대운, 자미두수 궁합 무료, 자미두수 12궁, 자미두수 vs 사주, 자미두수 부처궁/재백궁/...
- **콘텐츠**: 14주성 시리즈 14편 + 12궁 시리즈 12편 = **26편 블로그** (ISR)

### 11-2. 인프라

- Naver Search Console + Google Search Console
- 구조화 데이터: `Application`, `FAQPage`, `Article`, `BreadcrumbList`
- `sitemap.ts`: 공개 `/share/[token]` 동적 포함
- `robots.ts`: `/mypage`, `/chart/*`, `/api/*` Disallow
- Analytics: Vercel Analytics + PostHog (퍼널)

### 11-3. 6개월 로드맵

| 월 | 주요 활동 | 목표 KPI |
|---|---|---|
| M1-2 | SEO 26편 콘텐츠 발행, Search Console 등록 | 검색 인덱스 100+ |
| M3-4 | 인스타·X UGC 챌린지 ("내 명궁 보여주기"), 공유 카드 최적화 | 가입자 5,000 |
| M5-6 | 무료→PREMIUM 7일 체험 도입, 연말 대운 캠페인 | 유료 전환 5%, MRR 200만 |

---

## 12. 리스크 & 완화

| 리스크 | 완화 |
|---|---|
| 자미두수 시장 자체가 작다 | 사주 키워드(보조) 유입 + "자미두수 vs 사주" 비교 콘텐츠로 카테고리 교육 |
| iztro 정확성 학파 이견 | 결과 페이지 디스클로저: "iztro 오픈소스 엔진·일부 학파와 다를 수 있음" |
| AI 환각·점술 윤리 | 시스템 프롬프트 가드레일, 운명론 단정 금지, 의학/법률/금융 거부 |
| 결제 분쟁 | 7일 환불 보장 명시, Toss 표준 약관 준수 |

---

## 13. 부트스트랩 & 검증

### 13-1. 설치

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev
```

### 13-2. 골든 패스 (수동/Playwright)

1. 랜딩 → "무료 명반" CTA
2. `/chart/new` 양력 2000-08-16 02:00 남 입력 → 제출
3. 가입 모달 (Kakao or Email)
4. `/chart/[id]` 12궁 그리드 (명궁 등 한국어 확인)
5. AI 챗: "내 명궁 주성은?" → 스트리밍 응답
6. 공유 토큰 발급 → `/share/[token]` OG 이미지
7. 프리미엄 → Toss 테스트 결제 → unlock
8. 두 번째 명반 → `/compatibility` → 점수

### 13-3. 환경 변수 (`.env.local`)

```bash
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
EMAIL_SERVER=
EMAIL_FROM=
AI_GATEWAY_API_KEY=
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
TOSS_WEBHOOK_SECRET=
SHARE_TOKEN_SECRET=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

---

## 14. 구현 우선순위

1. **부트스트랩**: Next.js 16 + shadcn/ui + Prisma + 디자인 토큰
2. **인증**: NextAuth + Kakao
3. **명반 코어**: iztro 래퍼 → `/chart/new` 폼 → `/chart/[id]` 12궁 그리드
4. **차별화 1·3·4**: AI 챗봇 → OG 공유 카드 → 대운 타임라인 (사용자 가시 가치 우선)
5. **차별화 2**: 궁합 알고리즘 → `/compatibility`
6. **수익화**: `/pricing` → Toss 위젯 → confirm/webhook → 게이팅
7. **SEO·블로그**: sitemap → 콘텐츠 26편
8. **배포**: Vercel + Neon + Cron + 환경변수

---

## 15. 출처

- iztro: https://github.com/SylarLong/iztro · npm `iztro` · `ko-KR` 로케일 공식 지원
- Toss Payments: https://docs.tosspayments.com/sdk/v2/js, /integration-widget, /webhooks
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway/getting-started
- 시장: 한경 점술 시장 1.4조 (2024.05), 포스텔러 860만 누적 가입
