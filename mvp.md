# 자미두수(紫微斗數) MVP 기획서

> **버전**: v1.1 (현재 코드 반영)
> **마지막 업데이트**: 2026-06-10
> **포지션**: 한국 최초의 **자미두수 단일 특화 + AI 해석 + 모던 모바일-퍼스트 UX** 운명분석 웹서비스

---

## 1. 한 줄 요약

> "사주 다음은 자미두수." — **로그인 없이 1초 만에** 만드는 내 명반, AI가 자유롭게 풀이하는 12궁, 인스타로 공유하는 우주.

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
| 1 | **AI 명반 해석 챗봇** | 정적 텍스트만, 또는 GPT-3.5 수준 | Google Gemini + 내 명반 컨텍스트 주입 (플랜별 모델 분기) | 프리미엄 전환 핵심 |
| 2 | **궁합 분석 (두 명반 비교)** | 자미두수 궁합은 희소 | 자체 점수 알고리즘 (지지 6합·사화 충돌·오행국 상생) | 커플·소개팅 시장 진입 |
| 3 | **모바일-퍼스트 폰 프레임 UX + 공유 카드** | 1990년대 디자인 | 데스크탑에선 iPhone 14 비율(390×844) 목업, 자색·금색 + Nanum Myeongjo · 인스타·카톡 OG 자동 생성 | 자발적 바이럴 → CAC 절감 |
| 4 | **대운/유년 인터랙티브 타임라인** | 텍스트 나열 | Recharts 그래프 + "2026년의 나" 클릭 → 즉시 해석 | 재방문 후크 |

---

## 4. 가격 정책 (수익 구조) — 계획

> 코드상 결제 라우트는 아직 미구현. 패키지만 설치된 상태(@tosspayments/tosspayments-sdk). 아래는 목표 가격표.

| 플랜 | 가격 | 포함 내용 |
|---|---|---|
| **무료(게스트 포함)** | 0원 | 명반 1~3개 저장, 12궁 기본 해석, AI 챗 일 5턴(Gemini Flash), 공유 카드 |
| **건당 프리미엄 해석** | **9,900원** | 단일 명반의 깊이 해석 PDF + 대운/유년 종합 리포트 + AI 100턴 |
| **PREMIUM 월구독** | **9,900원/월** | 명반 무제한 저장, AI Gemini Flash 일 50턴, 모든 명반 프리미엄 자동 unlock |
| **PRO 월구독** | **19,900원/월** | + 궁합 무제한, Gemini 2.5 Pro, 우선 지원 |

- 연구독: **−20%** (PREMIUM 95,000원/년, PRO 191,000원/년)
- 단건 결제: 7일 이내 환불 보장 (전자상거래법 준수)
- 결제 수단: **Toss Payments** (한국 사용자 친화적, 카드/계좌/카카오페이/네이버페이)

플랜별 한도는 `lib/entitlements.ts`의 `CONFIG`에 단일 진실원으로 정의(이미 구현됨, 결제 흐름만 미구현).

---

## 5. 기술 스택 & 아키텍처 — 현재 코드 기준

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router · Turbopack) + React 19 + TS 5     │
├──────────────────────────────────┬──────────────────────────┤
│  UI: 인라인 style + Tailwind v4  │  자색·금색 디자인 토큰    │
│                                  │  (theme/tokens.ts)        │
│  Auth: Supabase Auth (Kakao etc) │  + lib/guest.ts 게스트    │
│  DB: Prisma 6 + Supabase Postgres│  pooler(6543) + direct    │
│                                  │  (5432, migration 용)     │
│  명반 엔진: iztro v2.5.8 (ko-KR) │  + lunar-typescript       │
│  AI: AI SDK v4 + @ai-sdk/google  │  Gemini Flash/2.0/2.5 Pro │
│  결제: @tosspayments/sdk (미구현) │  계획 단계                │
│  공유 카드: @vercel/og           │  ImageResponse 1200×630   │
│  타임라인: Recharts              │  대운/유년 그래프         │
│  배포: Vercel                    │  Supabase Marketplace 연동│
└──────────────────────────────────┴──────────────────────────┘
```

### 5-1. 모바일-퍼스트 폰 프레임 (`app/layout.tsx`)

- **모바일(<sm)**: 콘텐츠가 viewport 전체를 채움 (`w-full h-[100dvh]`)
- **데스크탑(sm+)**: iPhone 14 비율(390×844) 폰 목업을 화면 중앙에 띄움
  - 상단에 iOS 상태바 (9:41 + 노치 + 신호·Wi-Fi·배터리) — `mix-blend-mode: difference`로 라이트·다크 배경 자동 대비
  - 하단에 홈 인디케이터
- 프레임에 `transform: translateZ(0)` 명시 → `position: fixed` 시트(PickerSheet/ShareSheet 등)가 viewport 대신 프레임에 attach (베젤 밖으로 안 나감)

---

## 6. 디렉토리 구조 (현재 실측)

```
/Users/admin/Desktop/zamidusu/
├─ app/
│  ├─ page.tsx                       # 랜딩 (/)
│  ├─ layout.tsx                     # 폰 프레임 + 상태바 + 홈 인디케이터
│  ├─ globals.css · robots.ts · sitemap.ts
│  ├─ not-found.tsx                  # 커스텀 404 (한국어, 다크 보라)
│  ├─ sign-in/{page,client}.tsx      # Supabase Auth UI
│  ├─ login/page.tsx                 # /sign-in 알리아스 (쿼리 보존)
│  ├─ auth/callback/route.ts         # Supabase OAuth 콜백
│  ├─ mypage/{page,client}.tsx       # 마이페이지 (로그인 필요)
│  ├─ chart/
│  │  ├─ new/{page,client}.tsx       # 출생정보 입력 폼
│  │  └─ [id]/
│  │      ├─ {page,client}.tsx       # 결과 화면 — Hero + 풀-와이드 plate + 12영역
│  │      ├─ ai/page.tsx             # AI 해석 챗
│  │      ├─ timeline/page.tsx       # 대운/유년 (Recharts 예정)
│  │      └─ palace/[key]/{page,client}.tsx  # 단일 궁 디테일
│  ├─ compatibility/
│  │  ├─ {page,form}.tsx
│  │  └─ [id]/page.tsx               # 궁합 결과
│  ├─ share/[token]/page.tsx         # 공개 공유 페이지
│  └─ api/
│     ├─ charts/{route,[id]/route,[id]/share/route}.ts
│     ├─ compatibility/route.ts
│     ├─ ai/chat/route.ts            # Gemini 스트리밍
│     └─ og/chart/[id]/route.tsx     # OG 이미지 (id OR shareToken)
├─ components/
│  ├─ ziwei/                         # 핵심 화면·컴포넌트
│  │  ├─ Plate.tsx                   # 4×4 plate 그리드 (12 셀 button)
│  │  ├─ atoms.tsx · common.tsx · use-nav.ts
│  │  ├─ screens/{Onboarding,Input,Result,Detail,Login,Mypage}.tsx
│  │  └─ sheets/{ShareSheet,QASheet,LoginGate,Toast}.tsx
│  ├─ chart/ · share/ · marketing/ · ui/  # 보조 컴포넌트
├─ lib/
│  ├─ iztro/{generate,serialize,horoscope,compatibility,to-areas,types}.ts
│  ├─ ai/{gateway,prompt-builder,guardrails}.ts   # Gemini 추상화
│  ├─ supabase/{client,server}.ts
│  ├─ share/kakao.ts
│  └─ {auth,db,entitlements,guest,share-token,ziwei-types,utils}.ts
├─ prisma/schema.prisma              # Postgres + directUrl 분리
├─ middleware.ts                     # /mypage 로그인 강제
├─ vercel.json · next.config.ts
├─ .env(.example) · tests/iztro.spec.ts
└─ mvp.md (본 문서)
```

---

## 7. 데이터 모델 (Prisma)

### 7-1. datasource

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // 런타임 — Supabase Transaction Pooler (6543)
  directUrl = env("DIRECT_URL")     // 마이그레이션 — 직결 (5432)
}
```

- 런타임 URL에는 `?pgbouncer=true&connection_limit=1` 필수 (PgBouncer 트랜잭션 모드에서 Prisma의 prepared statement 캐시 충돌 = `42P05` 방지)

### 7-2. 핵심 엔티티

- **User / Account / Session / VerificationToken** — Supabase Auth와 우리 DB의 user.id가 동일(`auth.upsert`로 동기화). VerificationToken은 미사용(NextAuth 잔재, 추후 정리).
- **Chart** — `payload String`(iztro 전체 산출물 JSON 캐시) + `iztroVersion` + `shareToken` + `isPremiumUnlocked`
- **Subscription** — `plan`(FREE/PREMIUM/PRO) + `status` + `tossBillingKey?` + `currentPeriodEnd?`
- **Payment** — `orderId/paymentKey` unique + `productType` + `productRef`(Chart.id 또는 Subscription.id)
- **AiConversation** — `chartId` 연결 + `messages String`(JSON) + `tokenUsage`
- **Compatibility** — `chartA/B` + `score` + `detail String`(JSON)

> 기획서 ERD의 `palaces`/`stars` 마스터 테이블은 제거. iztro가 stateless 함수형 라이브러리라 런타임 산출. Chart.payload 한 컬럼에 캐시.

---

## 8. 차별화 기능 4가지 — 구현 디테일

### 8-1. AI 명반 해석 챗봇

- **파일**: `app/api/ai/chat/route.ts`, `lib/ai/{gateway,prompt-builder,guardrails}.ts`
- **로직**: Vercel AI SDK v4 `streamText` + Google Gemini
  - FREE: `gemini-1.5-flash` (가성비, 무료 tier 가능)
  - PREMIUM: `gemini-2.0-flash`
  - PRO: `gemini-2.5-pro` (1M 컨텍스트)
- **시스템 프롬프트**: Chart.payload의 12궁·14주성·사화·신주·오행국을 한국어로 요약 주입
- **가드레일**: 운명론 단정 금지("~할 가능성이 있다"), 의학/법률/금융 거부, 차별 표현 금지
- **레이트 리밋**: 계획 — Vercel Runtime Cache 키 `ai:${userId}:${YYYYMMDD}`

### 8-2. 궁합 분석 (자체 알고리즘)

- **파일**: `lib/iztro/compatibility.ts`, `app/api/compatibility/route.ts`, `app/compatibility/{page,form}.tsx`
- **점수 0-100**, 카테고리: love(0.5)/work(0.3)/family(0.2)
- **룰**:
  - 명궁 지지 6합 → +20, 6충 → −15
  - 부처궁 ↔ 상대 명궁 주성 호환 (자미·천부 +15, 칠살·파군 −5)
  - 사화 화기궁이 상대 명궁이면 −10, 화록궁이면 +15
  - 오행국 상생 +10, 상극 −5

### 8-3. 모바일-퍼스트 UX + 공유 카드

- **파일**: `app/layout.tsx`(폰 프레임), `app/api/og/chart/[id]/route.tsx`(OG)
- **`@vercel/og`의 `ImageResponse`** — 1200×630 PNG (Node runtime)
- **OG 라우트**는 `id` OR `shareToken` 양쪽 허용 — 공개 공유 페이지에서도 호출
- **디자인**: 자색 그라데이션 + 금색 명궁/주성/오행국 + Nanum Myeongjo
- **카카오 공유**: `lib/share/kakao.ts` + Kakao JS SDK `Kakao.Share.sendDefault({ objectType: 'feed' })`

### 8-4. 대운/유년 인터랙티브 타임라인 (계획)

- **파일**: `app/chart/[id]/timeline/page.tsx` (라우트만 존재)
- **계획**: `components/timeline/DecadalTimeline.tsx` — Recharts `LineChart` x축 10년 구간, y축 길/흉성 합산. 점 클릭 → 시트 열려 해당 10년 12궁 + 유년 그리드.

---

## 9. 결과 화면 구조 (`/chart/[id]`)

명반 페이지를 별도 라우트(`/chart/[id]/plate`)에서 분리하지 않고 **결과 화면 한 페이지에 풀-와이드 plate + 12 영역 버튼**으로 통합 (스크롤 단일 페이지).

```
┌─ Hero (자색 그라데이션, rounded bottom)
│   이름 · 생일·시진 · 저장·공유 + 명궁 요약 카드
├─ 명반 차트 섹션 (풀-와이드 다크)
│   쉬운/전통 보기 토글 + 4×4 Plate (12 셀 button + aria-pressed)
│   선택 궁 카드 + "이 자리 자세히 보기 →" Link
├─ 스크롤 안내 (↓ 펄스 애니메이션)
└─ 12 영역 카드 리스트 (Link)
    기본 6개(命/夫妻/財帛/官祿/疾厄/田宅) + "나머지 6개 더보기"
```

**삭제됨**: 하단 TabBar(`홈`/`명반`/`마이`). 명반 페이지(`/chart/[id]/plate`)와 Chart.tsx 컴포넌트도 함께 제거. Mypage는 BackBar로 뒤로 가기 동선 유지.

---

## 10. 명반 계산 엔진 — iztro 통합

검증된 오픈소스 자미두수 라이브러리 **iztro v2.5.8** (MIT, TypeScript) 사용.

- 양/음력 자동 변환 (`astrolabeBySolarDate` / `astrolabeByLunarDate`)
- 12궁·14주성·보좌성·잡성·사화 자동 배치
- 대운/유년/유월/유일/유시 `astrolabe.horoscope(date)`
- `"ko-KR"` 로케일 → 궁명 한국어로 반환 (단, **궁 suffix 없이** "부모"/"부처"/"형제" 형태)
- 한국 시간 hour(0-23) → iztro `timeIndex`(0-12 시진) 변환 헬퍼 (`lib/iztro/generate.ts`)
- **버그 픽스 적용**: `lib/iztro/to-areas.ts`의 `NAME_MAP` 룩업이 궁 suffix 없는 이름도 받도록 폴백 — 이전엔 12궁 중 1개(명궁)만 렌더링되던 문제 해결

회귀 테스트: `vitest`로 알려진 케이스(2000-08-16 02시 남) 스냅샷 비교 (`tests/iztro.spec.ts`).

---

## 11. 인증 · 게스트 · 결제

### 11-1. Supabase Auth + 게스트 사용자

기획서의 NextAuth 대신 **Supabase Auth로 통일**.

- **로그인**: `app/sign-in` + `components/ziwei/screens/Login.tsx` — Kakao OAuth + 이메일 magic link (Supabase가 발송)
- **콜백**: `app/auth/callback/route.ts` — Supabase 세션 쿠키 설정 후 `redirectTo`로 이동
- **API 호환**: `lib/auth.ts`의 `auth()`는 NextAuth와 동일한 `{ user: { id, email, name } }` 형태 반환 → 기존 페이지·라우트 핸들러 시그니처 그대로 유지
- **DB 동기화**: 첫 로그인 시 Supabase user.id를 그대로 Prisma User.id로 upsert (외래키 연결)
- **/login 알리아스**: `app/login/page.tsx`가 쿼리 보존하며 `/sign-in`으로 server redirect

**게스트 사용자** (`lib/guest.ts`):
- `zmds_guest` httpOnly 쿠키에 `guest_${nanoid(16)}` 저장
- 비로그인도 명반 생성·저장 가능, 게스트 user에 귀속
- 같은 브라우저에서 만든 명반은 유지, 가입 후 마이그레이션은 추후

### 11-2. Toss Payments — 계획 (미구현)

> 코드상 `@tosspayments/tosspayments-sdk` 패키지만 설치. 라우트(`app/api/payments/*`, `app/api/cron/billing`)와 `/pricing` 페이지는 아직 없음.

계획:
1. `POST /api/payments/init` → DB에 `Payment{status:READY, orderId, amount}`
2. 클라이언트 위젯: `loadTossPayments(clientKey).widgets(customerKey).requestPayment(...)`
3. `successUrl=/api/payments/confirm` 콜백 → amount 검증 → Toss confirm 호출 → `status:DONE` + `grantEntitlement()`
4. 웹훅 `/api/payments/webhook` — 멱등성 키 `paymentKey+status`
5. 정기결제: 빌링키 발급 → Vercel Cron `0 3 * * *`

### 11-3. 게이팅 (`lib/entitlements.ts` — 구현됨)

플랜별 `aiTurnsPerDay`/`model`/`compatibility`/`maxCharts` 한도 단일 진실원. `getEntitlements(userId)` 호출 시 활성 `Subscription` 조회 → FREE 폴백.

---

## 12. 에러 처리 · 접근성 · 견고성

### 12-1. 친절 에러 응답 (`app/api/charts/route.ts`)

- 전체 핸들러 try/catch — 어떤 예외도 JSON 본문으로 응답 (이전엔 500 + 빈 본문 → 프론트 `Unexpected end of JSON input`)
- iztro 영문 에러는 **사용자 친화적 한글로 번역** (400 status) — 예: `"only 29 days in lunar year 2012 month 12"` → `"음력 12월은 29일까지만 있어요. 일을 다시 선택해 주세요."`
- Prisma 알려진 에러 코드는 한글 매핑 (P2002/P2025/P1001/P1008/P1017 등)
- 매핑 안 된 예외는 `GENERIC_500` 일반 메시지만 반환 — **내부 message/stack 절대 노출 안 함**
- 풀 디테일은 `console.error("[POST /api/charts] ...", err)`로 서버 로그에 남김
- 입력 폼은 day 옵션을 선택한 달력/월에 맞춰 동적 산출 (양력 정확 말일, 음력 30일 보수)

### 12-2. 접근성 (a11y)

- 모든 네비게이션 `<span onClick>` → **`<Link>`** (Next.js, SSR-friendly, `<a>` 렌더)
- 모든 동작 `<div onClick>` → **`<button type="button">`** + `aria-label`
- Plate 12 셀 → `<button aria-pressed={selected}>` (상태 토글)
- `:focus-visible` 골드 outline 전역 (키보드 사용자만 보임)
- `aria-label` 한국어로 충분히 명시 ("로그인 페이지로 이동", "夫妻宮 (연애·결혼) 상세 보기" 등)
- 상태바 텍스트/아이콘 `mix-blend-mode: difference` → 어떤 배경 위에서도 자동 대비
- 커스텀 404 (`app/not-found.tsx`): WCAG AAA(흰색/다크 보라 15:1, 보조 12:1, CTA 8.5:1)

### 12-3. 라우트 견고성 (`components/ziwei/use-nav.ts`)

- chartId 없이 `result`/`detail` 호출 시 `"/"` 폴백 + dev 경고 (이전엔 `/chart/current` 가짜 id → 404)
- ScreenKey 정리: `loading`(데드), `chart`(plate 삭제) 제거

---

## 13. SEO & 마케팅

### 13-1. 키워드 전략

- **1차 (검색량)**: 자미두수 (5K+), 자미두수 명반 (1.5K), 자미두수 무료 (1.2K), 자미두수 보는법
- **2차 (long-tail, 전환 ↑)**: 자미두수 대운, 자미두수 궁합 무료, 자미두수 12궁, 자미두수 vs 사주, 자미두수 부처궁/재백궁/...
- **콘텐츠 (계획)**: 14주성 시리즈 14편 + 12궁 시리즈 12편 = **26편 블로그** (ISR)

### 13-2. 인프라

- Naver Search Console + Google Search Console
- 구조화 데이터 (계획): `Application`, `FAQPage`, `Article`, `BreadcrumbList`
- `app/sitemap.ts`: 공개 `/share/[token]` 동적 포함 (구현됨)
- `app/robots.ts`: `/mypage`, `/chart/*`, `/api/*` Disallow (구현됨)
- Analytics (계획): Vercel Analytics + PostHog

### 13-3. 6개월 로드맵

| 월 | 주요 활동 | 목표 KPI |
|---|---|---|
| M1-2 | SEO 26편 콘텐츠 발행, Search Console 등록 | 검색 인덱스 100+ |
| M3-4 | 인스타·X UGC 챌린지 ("내 명궁 보여주기"), 공유 카드 최적화 | 가입자 5,000 |
| M5-6 | Toss 결제 통합 + 무료→PREMIUM 7일 체험, 연말 대운 캠페인 | 유료 전환 5%, MRR 200만 |

---

## 14. 리스크 & 완화

| 리스크 | 완화 |
|---|---|
| 자미두수 시장 자체가 작다 | 사주 키워드(보조) 유입 + "자미두수 vs 사주" 비교 콘텐츠로 카테고리 교육 |
| iztro 정확성 학파 이견 | 결과 페이지 디스클로저: "iztro 오픈소스 엔진·일부 학파와 다를 수 있음" |
| AI 환각·점술 윤리 | 시스템 프롬프트 가드레일 (`lib/ai/guardrails.ts`), 운명론 단정 금지, 의학/법률/금융 거부 |
| 결제 분쟁 | 7일 환불 보장 명시, Toss 표준 약관 준수 |
| Supabase Pooler 트랜잭션 모드의 prepared statement 충돌 | DATABASE_URL에 `?pgbouncer=true&connection_limit=1`, schema에 `directUrl` 분리 (마이그레이션은 5432 직결). 그래도 발생 시 fallback: `@prisma/adapter-pg` driverAdapter 도입 |

---

## 15. 부트스트랩 & 검증

### 15-1. 설치

```bash
npm install
npx prisma generate
npx prisma db push          # Supabase Postgres에 스키마 반영 (DIRECT_URL 사용)
npm run dev
```

### 15-2. 골든 패스 (수동/Playwright)

1. 랜딩(/) → "무료 명반" CTA → `/chart/new`
2. 양력 1990-05-20 07:00(辰時) 남 입력 → 제출 → 게스트 쿠키 자동 발급
3. `/chart/[id]` 결과 화면 — 풀-와이드 plate + 12 영역 카드 (모두 `<Link>`)
4. 가입 시트 (Kakao or 이메일) — 선택사항
5. AI 챗 (`/chart/[id]/ai`): "내 명궁 주성은?" → Gemini 스트리밍 응답
6. 공유 토큰 발급 → `/share/[token]` OG 이미지 표시
7. (계획) 프리미엄 → Toss 테스트 결제 → unlock
8. 두 번째 명반 → `/compatibility` → 점수

### 15-3. 환경 변수 (`.env`)

```bash
# Prisma DB 연결 (Supabase Pooler)
# - 런타임 (트랜잭션 풀러, 6543) — pgbouncer=true 필수
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-[n]-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# - 마이그레이션 (직결, 5432) — pgbouncer 파라미터 X
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-[n]-[region].pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SITE_URL="https://zamidusu.vercel.app"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY="..."

# 카카오 공유 (선택)
NEXT_PUBLIC_KAKAO_JS_KEY="..."
```

> **Vercel 환경변수도 동일하게** Settings → Environment Variables에 등록. `NEXT_PUBLIC_*`은 빌드 타임 인라인이라 변경 시 **재배포 필수**.

---

## 16. 구현 우선순위 (현재 진행)

1. ✅ 부트스트랩: Next.js 16 + Tailwind v4 + Prisma + 디자인 토큰
2. ✅ 인증: Supabase Auth + Kakao + 게스트 흐름
3. ✅ 명반 코어: iztro 래퍼 → `/chart/new` 폼 → `/chart/[id]` 결과 (plate + 12 영역 통합)
4. ✅ 차별화 1: AI 챗봇 (Gemini, AI Gateway 추상화)
5. ✅ 차별화 3: 모바일-퍼스트 폰 프레임 + OG 공유 카드
6. ⏳ 차별화 4: 대운 타임라인 — 라우트만 (Recharts 그래프 미구현)
7. ✅ 차별화 2: 궁합 알고리즘 → `/compatibility`
8. ⏳ 수익화: Toss 결제 — 라우트·페이지 미구현
9. ⏳ SEO·블로그 26편 — sitemap/robots만 구현
10. ✅ 배포: Vercel + Supabase Postgres (Pooler) + 환경변수

---

## 17. 출처

- iztro: https://github.com/SylarLong/iztro · npm `iztro` · `ko-KR` 로케일 공식 지원
- Supabase: https://supabase.com/docs/guides/auth · /database/connecting-to-postgres
- Vercel AI SDK: https://sdk.vercel.ai/docs · `@ai-sdk/google` Gemini 통합
- Toss Payments: https://docs.tosspayments.com/sdk/v2/js, /integration-widget, /webhooks
- Prisma + PgBouncer: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- 시장: 한경 점술 시장 1.4조 (2024.05), 포스텔러 860만 누적 가입
