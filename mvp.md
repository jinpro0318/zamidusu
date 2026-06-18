# 자미두수(紫微斗數) MVP 기획서

> **버전**: v2.0 (현재 코드 반영 — 결제·깊은풀이·3단계 권한 구현)
> **마지막 업데이트**: 2026-06-18
> **포지션**: 한국 최초의 **자미두수 단일 특화 + AI 해석 + 모던 모바일-퍼스트 UX** 운명분석 웹서비스

> **v2.0 주요 변경 (이번 마일스톤)**
> - 💳 **수익화 실구현**: chart 1개 = "깊은 풀이"를 **1,900원 무통장입금** 단건 결제로 영구 잠금해제 (관리자 입금확인 → PAID). `Purchase` 모델 + 결제 안내 모달.
> - 🔮 **깊은 풀이(전체풀이) 신규**: 궁을 "가로지르는" 종합(궁 상호작용 + 대운 시간축 + 인생 전략). 기존 궁별 상세풀이와 콘텐츠 **중복 금지** 프롬프트.
> - 🔐 **3단계 서버 권한**: 무료요약(누구나) / 궁별 상세풀이(로그인) / 깊은풀이(결제 PAID). UI 숨김이 아닌 **서버에서 강제**.
> - ⚡ **AI 응답 캐싱·가속**: `PalaceReading`·`DeepReading` 캐시(버전 키) + Gemini thinking-off + maxTokens로 재방문 0초·첫 토큰 단축.
> - 🤖 **모델 갱신**: Gemini 2.5 계열(flash-lite/flash/pro)로 통일(1.5 retire 대응).
> - 📱 **폰 목업 프레임 제거** → 480px 반응형 풀-블리드 컬럼.
> - 🎧 고객센터 플로팅 위젯(의견 보내기) — 차트 페이지 한정 노출.

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
| 1 | **AI 명반 해석 (궁별 상세풀이)** | 정적 텍스트만, 또는 GPT-3.5 수준 | Google Gemini 2.5 + 내 명반 컨텍스트 주입, 결과 캐싱(재방문 0초) | 로그인 유입 후크 |
| 2 | **깊은 풀이(전체풀이) — 유료** | 거의 부재 | 궁을 "가로지르는" 종합(궁 상호작용·대운 흐름·인생 전략), 궁별 풀이와 **중복 금지** | **단건 결제 수익 핵심** |
| 3 | **궁합 분석 (두 명반 비교)** | 자미두수 궁합은 희소 | 자체 점수 알고리즘 (지지 6합·사화 충돌·오행국 상생) | 커플·소개팅 시장 진입 |
| 4 | **모바일-퍼스트 UX + 공유 카드** | 1990년대 디자인 | 480px 반응형 컬럼, 자색·금색 + Nanum Myeongjo · 인스타·카톡 OG 자동 생성 | 자발적 바이럴 → CAC 절감 |
| 5 | **대운/유년 인터랙티브 타임라인** | 텍스트 나열 | Recharts 그래프(대운 점수) + 깊은풀이의 시간축 서술 | 재방문 후크 |

---

## 4. 가격 정책 (수익 구조)

### 4-1. 현재 구현 — 단건 결제(무통장입금) ✅

MVP 수익화는 **명반(chart) 1개 단위의 "깊은 풀이" 단건 잠금해제**로 시작한다. PG 연동 전 단계로 **무통장입금(수동 계좌이체)** 을 받고 관리자가 입금을 확인해 잠금을 해제한다. 추후 토스 자동결제로 전환할 수 있게 구조(`Purchase.method`)를 남겨둔다.

| 콘텐츠 | 가격 | 접근 조건 | 비고 |
|---|---|---|---|
| 무료요약(궁별 2~3줄) | 0원 | 누구나(비회원 포함) | 정적 콘텐츠 |
| 궁별 상세풀이 (AI) | 0원 | **로그인** 회원 (턴 한도 없음) | 로그인 유입 후크 |
| **깊은 풀이(전체풀이)** | **1,900원** | **결제(PAID)** — chart 1개 영구 잠금해제 | 단건 수익 |

**결제 흐름(무통장입금):**
1. 깊은풀이 잠금 카드 탭 → **무통장입금 모달**(계좌 표시 + 입금자명 입력 + "입금 완료했어요").
2. 제출 → `POST /api/purchase` → `Purchase{status: PENDING}` 생성/갱신 → "입금 확인 후 열려요" 안내.
3. **관리자가 입금 확인** → `Purchase.status = PAID`(현재 수동) → 깊은풀이 페이지 잠금 해제.
4. 계좌정보는 **서버 env**(`BANK_NAME`/`BANK_ACCOUNT`/`BANK_HOLDER`)에서 읽어 표시(하드코딩 없음). 계좌번호는 모달에서 **복사 버튼** 제공.

### 4-2. 향후 확장 (계획)

- **토스 자동결제 전환**: `@tosspayments/tosspayments-sdk`(설치됨) + `Purchase.method="TOSS"`로 확장. env(`NEXT_PUBLIC_TOSS_CLIENT_KEY`/`TOSS_PAYMENTS_SECRET_KEY`)는 이미 준비.
- **구독제(PREMIUM/PRO)**: `Subscription` 모델·`lib/entitlements.ts`의 `premiumUnlock`로 "구독자는 결제 없이 전체 열람" 우회 지원(스키마·게이팅 chokepoint `lib/purchase.ts`에 준비).
- 단건 결제 7일 환불 보장(전자상거래법 준수) 등 약관 정비.

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
│  AI: AI SDK v4 + @ai-sdk/google  │  Gemini 2.5 flash-lite/   │
│                                  │  flash/pro (플랜별)       │
│  AI 캐싱: PalaceReading/DeepReading│ 버전 키 + thinking-off    │
│  결제: 무통장입금(구현) +        │  @tosspayments/sdk(설치,  │
│        Purchase 모델·관리자 확인  │  자동결제는 향후)         │
│  공유 카드: @vercel/og           │  ImageResponse 1200×630   │
│  타임라인: Recharts              │  대운 점수 그래프         │
│  배포: Vercel                    │  Supabase Marketplace 연동│
└──────────────────────────────────┴──────────────────────────┘
```

### 5-1. 반응형 풀-블리드 레이아웃 (`app/layout.tsx`)

> v2.0에서 **iPhone 폰 목업 프레임을 제거**하고 단일 480px 반응형 컬럼으로 단순화했다.

- **모바일**: 콘텐츠가 viewport 전체를 채움 (`w-full h-dvh`)
- **데스크탑/태블릿**: 중앙 정렬 **480px 고정폭 컬럼**(`max-w-[480px]`), 양옆 여백 — 모든 기기 동일 앱 컬럼.
- 컬럼에 `transform: translateZ(0)` → `position: fixed` 시트(PickerSheet/ShareSheet/LoginGate/DepositSheet 등)가 viewport 대신 컬럼에 attach.
- 내부 스크롤 컨테이너(`no-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden`, `data-scroll-root`)가 본문 스크롤 담당 → 고객센터 플로팅 위젯이 이 컨테이너의 scroll을 구독(스크롤 다운 시 숨김).

---

## 6. 디렉토리 구조 (현재 실측)

```
/Users/admin/Desktop/zamidusu/
├─ app/
│  ├─ page.tsx                       # 랜딩 (/)
│  ├─ layout.tsx                     # 480px 반응형 컬럼 + 고객센터 위젯
│  ├─ globals.css · robots.ts · sitemap.ts
│  ├─ not-found.tsx                  # 커스텀 404 (한국어, 다크 보라)
│  ├─ sign-in/{page,client}.tsx      # Supabase Auth UI
│  ├─ login/page.tsx                 # /sign-in 알리아스 (쿼리 보존)
│  ├─ auth/callback/route.ts         # Supabase OAuth 콜백
│  ├─ mypage/{page,client}.tsx       # 마이페이지 (로그인 필요)
│  ├─ chart/
│  │  ├─ new/{page,client}.tsx       # 출생정보 입력 폼
│  │  └─ [id]/
│  │      ├─ {page,client}.tsx       # 결과 화면 — Hero + 풀-와이드 plate + 12영역 + 프리미엄 섹션
│  │      ├─ ai/page.tsx             # 12궁 전체 상세풀이 챗 (로그인)
│  │      ├─ deep/{page,client}.tsx  # 🔮 깊은 풀이 (결제 PAID 서버 게이트)
│  │      ├─ timeline/page.tsx       # 대운 타임라인 (Recharts)
│  │      └─ palace/[key]/{page,client}.tsx  # 단일 궁 상세풀이 (로그인)
│  ├─ compatibility/
│  │  ├─ {page,form}.tsx
│  │  └─ [id]/page.tsx               # 궁합 결과
│  ├─ share/[token]/page.tsx         # 공개 공유 페이지
│  └─ api/
│     ├─ charts/{route,[id]/route,[id]/share/route}.ts
│     ├─ compatibility/route.ts
│     ├─ ai/chat/route.ts            # Gemini 스트리밍 + 캐시 + 3단계 게이트
│     ├─ purchase/route.ts           # 무통장입금 신청 (Purchase PENDING)
│     ├─ feedback/route.ts           # 고객센터 의견
│     ├─ auth/adopt-guest/route.ts   # 게스트→회원 데이터 인계
│     └─ og/chart/[id]/route.tsx     # OG 이미지 (id OR shareToken)
├─ components/
│  ├─ ziwei/                         # 핵심 화면·컴포넌트
│  │  ├─ Plate.tsx                   # 4×4 plate 그리드 (12 셀 button)
│  │  ├─ atoms.tsx · common.tsx · use-nav.ts
│  │  ├─ screens/{Onboarding,Input,Result,Detail,DeepReadingScreen,Login,Mypage}.tsx
│  │  ├─ premium/{PremiumSection,...}.tsx   # "내게 맞는 깊은 풀이" 섹션·잠금
│  │  └─ sheets/{ShareSheet,QASheet,LoginGate,DepositSheet,PalaceModal,Toast}.tsx
│  ├─ support/SupportWidget.tsx      # 고객센터 플로팅 위젯(차트 페이지 한정)
│  ├─ ai/{ChatPanel,AiText}.tsx      # 챗 UI + 용어 마킹 렌더
│  ├─ chart/ · share/ · marketing/ · ui/  # 보조 컴포넌트
├─ hooks/useHideOnScrollDown.ts      # 스크롤 다운 시 위젯 숨김
├─ lib/
│  ├─ iztro/{generate,serialize,horoscope,compatibility,to-areas,types}.ts
│  ├─ ai/{gateway,prompt-builder,guardrails}.ts   # Gemini + 궁별/깊은풀이 프롬프트
│  ├─ supabase/{client,server}.ts · site-url.ts(returnTo)
│  ├─ share/kakao.ts
│  └─ {auth,db,entitlements,guest,purchase,share-token,ziwei-types,utils}.ts
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

- **User** — Supabase Auth와 우리 DB의 user.id가 동일(`auth()` upsert로 동기화).
- **Chart** — `payload String`(iztro 전체 산출물 JSON 캐시) + `iztroVersion` + `shareToken` + `isPremiumUnlocked`
- **Purchase** ⭐신규 — chart 단건 구매. `userId+chartId` unique, `amount`(기본 1900), `method`(기본 "BANK_TRANSFER"→향후 "TOSS"), `depositorName?`, `status`(PENDING/PAID/CANCELLED), `paidAt?`. 깊은풀이 잠금해제의 단일 근거.
- **PalaceReading** ⭐신규 — 궁별 상세풀이 캐시. `(chartId, palaceKey, modelVersion, promptVersion)` unique → 모델/프롬프트 버전 바뀌면 자동 무효화. 재방문 0초.
- **DeepReading** ⭐신규 — 깊은풀이 캐시. `(chartId, section, modelVersion, promptVersion)` unique (`section="all"`).
- **Subscription** — `plan`(FREE/PREMIUM/PRO) + `status` + `tossBillingKey?` (향후 구독)
- **Payment** — `orderId/paymentKey` unique + `productType` + `productRef` (향후 PG)
- **AiConversation** — `chartId` 연결 + `messages String`(JSON) + `tokenUsage`
- **AiDailyUsage** — 일자별 턴 집계(현재 게이팅 미사용 — 분석용 잔존)
- **Feedback** — 고객센터 의견(type/message/email)
- **Compatibility** — `chartA/B` + `score` + `detail String`(JSON)

> 기획서 ERD의 `palaces`/`stars` 마스터 테이블은 제거. iztro가 stateless 함수형 라이브러리라 런타임 산출. Chart.payload 한 컬럼에 캐시.
> AI 결과 캐시(`PalaceReading`/`DeepReading`)는 **버전 키 설계**라 프롬프트/모델 개선 시 stale 반환 없이 자연 재생성된다.

---

## 8. 차별화 기능 4가지 — 구현 디테일

### 8-1. AI 명반 해석 (궁별 상세풀이)

- **파일**: `app/api/ai/chat/route.ts`, `lib/ai/{gateway,prompt-builder,guardrails}.ts`
- **로직**: Vercel AI SDK v4 `streamText` + Google Gemini **2.5** (플랜별 분기, `lib/ai/gateway.ts`)
  - FREE: `gemini-2.5-flash-lite` · PREMIUM: `gemini-2.5-flash` · PRO: `gemini-2.5-pro`
- **시스템 프롬프트**: Chart.payload의 12궁·14주성·사화·신주·오행국을 한국어로 요약 주입(`buildSystemPrompt`)
- **응답 캐싱·가속** ⭐: 초기 풀이는 `PalaceReading`에 캐시(버전 키) → 재방문 시 LLM 호출 없이 동일 스트림으로 즉시 반환. 초기 풀이엔 `thinkingConfig.thinkingBudget=0` + `maxTokens`로 첫 토큰(TTFB) 단축. 후속 자유질문은 기본값 유지.
- **가드레일**: 운명론 단정 금지("~할 가능성이 있다"), 의학/법률/금융 거부, 차별 표현 금지(`lib/ai/guardrails.ts`)
- **한도 정책**: 로그인 회원은 **무제한**(이전 FREE 5턴/일 게이트는 제거). 비로그인은 401.

### 8-2. 궁합 분석 (자체 알고리즘)

- **파일**: `lib/iztro/compatibility.ts`, `app/api/compatibility/route.ts`, `app/compatibility/{page,form}.tsx`
- **점수 0-100**, 카테고리: love(0.5)/work(0.3)/family(0.2)
- **룰**:
  - 명궁 지지 6합 → +20, 6충 → −15
  - 부처궁 ↔ 상대 명궁 주성 호환 (자미·천부 +15, 칠살·파군 −5)
  - 사화 화기궁이 상대 명궁이면 −10, 화록궁이면 +15
  - 오행국 상생 +10, 상극 −5

### 8-3. 모바일-퍼스트 UX + 공유 카드

- **파일**: `app/layout.tsx`(480px 반응형 컬럼), `app/api/og/chart/[id]/route.tsx`(OG)
- **`@vercel/og`의 `ImageResponse`** — 1200×630 PNG (Node runtime)
- **OG 라우트**는 `id` OR `shareToken` 양쪽 허용 — 공개 공유 페이지에서도 호출
- **디자인**: 자색 그라데이션 + 금색 명궁/주성/오행국 + Nanum Myeongjo
- **카카오 공유**: `lib/share/kakao.ts` + Kakao JS SDK `Kakao.Share.sendDefault({ objectType: 'feed' })`

### 8-4. 대운 타임라인

- **파일**: `app/chart/[id]/timeline/page.tsx` + `components/timeline/DecadalTimeline.tsx`
- Recharts `LineChart` — x축 10년 대운 구간, y축 길성/흉성·사화 가중 점수, 현재 나이 하이라이트. 데이터는 payload `palaces[].decadal` 직접 추출. (세운 연 단위는 payload에 없어 향후 데이터 확보 시 확장.)

### 8-5. 🔮 깊은 풀이(전체풀이) — 유료 ⭐신규

- **파일**: `lib/ai/prompt-builder.ts`(`buildDeepReadingPrompt`), `app/api/ai/chat/route.ts`(`mode:"deep"` 분기), `app/chart/[id]/deep/{page,client}.tsx`, `components/ziwei/screens/DeepReadingScreen.tsx`
- **콘텐츠 정의 — 궁별 상세풀이와 절대 중복 금지**:
  - ① 궁 간 상호작용/시너지(명궁×재백궁 등 "관계"만, 개별 궁 재설명 금지)
  - ② 대운 시간축 흐름(상세풀이엔 없는 시간 정보, payload `decadal` 주입)
  - ③ 12궁 관통 인생 테마 + 강점활용·약점보완 종합 전략
- **출력 4섹션**: `[종합 총평] [궁 상호작용] [대운 흐름] [종합 마무리]` (상세풀이의 `[성향][강점][주의][조언]`과 머리글 분리).
- **프롬프트에 명시**: "이미 궁별 상세풀이에서 다룬 개별 궁 설명을 반복하지 말고 연결·시간축·종합전략에 집중하라."
- **캐시**: `DeepReading`(section="all") + 같은 스트림 프로토콜로 즉시 반환. 결제(PAID) 통과자만 생성/조회.

### 8-6. 🔐 3단계 서버 권한

UI 숨김이 아니라 **서버에서 강제**(URL 직접 접근·API 직접 호출 모두 차단). 단일 판정 함수 `lib/purchase.ts`의 `hasPurchased(userId, chartId) = Purchase.status==="PAID"`.

| 층 | 콘텐츠 | 판정 위치 | 규칙 |
|---|---|---|---|
| 무료 | 12궁 요약(2~3줄) | `/chart/[id]`(정적) | 누구나 |
| 로그인 | 궁별 상세풀이 + 그 AI | `palace/[key]/page.tsx` + `/api/ai/chat` | 세션 필수(비회원 401/리다이렉트) |
| 결제 | 깊은 풀이 + 그 AI | `deep/page.tsx` + `/api/ai/chat`(`mode:"deep"`) | `hasPurchased`(PAID), 미결제 403/리다이렉트 |

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

### 11-2. 결제 — 무통장입금 (구현됨) ✅

> PG 연동 전 단계로 **수동 계좌이체 + 관리자 입금확인**. 구조는 토스 자동결제로 확장 가능하게 설계(`Purchase.method`).

- **신청**: `POST /api/purchase` — `auth()` 필수(회원 전용), chart 소유권 검증 → `Purchase` upsert(`userId+chartId` unique, 항상 `status:PENDING`). **status는 클라이언트가 정할 수 없음**(관리자만 PAID 전환).
- **UI**: `DepositSheet`(바텀시트) — 계좌(env) 표시 + 입금자명 입력 + "입금 완료했어요" → "입금 확인 후 열려요". 계좌번호 복사 버튼(숫자만 클립보드).
- **잠금 해제**: 관리자가 입금 확인 후 `Purchase.status=PAID`(현재 수동 DB) → 깊은풀이 서버 게이트 통과.
- **계좌 env**: `BANK_NAME`/`BANK_ACCOUNT`/`BANK_HOLDER` (서버 전용, 하드코딩 없음).
- **향후**: `@tosspayments/tosspayments-sdk`(설치됨) + env(`NEXT_PUBLIC_TOSS_CLIENT_KEY`/`TOSS_PAYMENTS_SECRET_KEY`, 준비됨)로 자동결제 전환 시 `successUrl→confirm→PAID` 자동화.

### 11-3. 권한 단일 출처

- **깊은풀이 결제 게이트**: `lib/purchase.ts` `hasPurchased(userId, chartId)` (= Purchase PAID). 서버 3단계 권한의 단일 chokepoint(§8-6).
- **플랜 한도(`lib/entitlements.ts`)**: `model`/`compatibility`/`maxCharts` 등 플랜별 설정 단일 진실원. `getEntitlements(userId)`가 활성 `Subscription` 조회 → FREE 폴백. (AI 턴 한도 `aiTurnsPerDay`는 정의돼 있으나 현재 게이팅에 미사용 — 로그인 회원 무제한.)

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
7. 깊은풀이 카드(🔒) → 무통장입금 모달 → 입금자명 제출 → `Purchase` PENDING → (관리자 PAID 전환) → `/chart/[id]/deep` 4섹션 깊은풀이
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

# 무통장입금 계좌 (깊은풀이 결제 안내 — 서버 전용, 하드코딩 금지)
BANK_NAME="..."
BANK_ACCOUNT="..."
BANK_HOLDER="..."

# 토스페이먼츠 (향후 자동결제 — 키 준비됨)
NEXT_PUBLIC_TOSS_CLIENT_KEY="..."
TOSS_PAYMENTS_SECRET_KEY="..."
```

> **Vercel 환경변수도 동일하게** Settings → Environment Variables에 등록. `NEXT_PUBLIC_*`은 빌드 타임 인라인이라 변경 시 **재배포 필수**.

---

## 16. 구현 우선순위 (현재 진행)

1. ✅ 부트스트랩: Next.js 16 + Tailwind v4 + Prisma + 디자인 토큰
2. ✅ 인증: Supabase Auth + Kakao + 게스트 흐름 + returnTo(`?next=`)
3. ✅ 명반 코어: iztro 래퍼 → `/chart/new` 폼(내 명반 불러오기) → `/chart/[id]` 결과
4. ✅ 차별화 1: AI 궁별 상세풀이 (Gemini 2.5) + **응답 캐싱·가속**
5. ✅ 차별화 2(신규): **🔮 깊은 풀이** — 콘텐츠 정의/생성·캐시·페이지·중복 금지
6. ✅ 차별화 3: 궁합 알고리즘 → `/compatibility`
7. ✅ 차별화 4: 모바일-퍼스트(480px 컬럼) + OG 공유 카드
8. ✅ 차별화 5: 대운 타임라인 (Recharts 점수 그래프)
9. ✅ **수익화: 무통장입금 단건 결제** — `Purchase` + 게이트 + 결제 모달 (PG 자동결제는 향후)
10. ✅ **3단계 서버 권한**: 무료요약 / 로그인 상세풀이 / 결제 깊은풀이
11. ✅ 고객센터 위젯(의견 보내기) + 차트 한정 노출
12. ⏳ 관리자 입금확인(PENDING→PAID) 화면 — 현재 수동 DB
13. ⏳ SEO·블로그 26편 — sitemap/robots만 구현
14. ✅ 배포: Vercel + Supabase Postgres (Pooler) + 환경변수(BANK_*/TOSS_* 포함)

---

## 17. 출처

- iztro: https://github.com/SylarLong/iztro · npm `iztro` · `ko-KR` 로케일 공식 지원
- Supabase: https://supabase.com/docs/guides/auth · /database/connecting-to-postgres
- Vercel AI SDK: https://sdk.vercel.ai/docs · `@ai-sdk/google` Gemini 통합
- Toss Payments: https://docs.tosspayments.com/sdk/v2/js, /integration-widget, /webhooks
- Prisma + PgBouncer: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- 시장: 한경 점술 시장 1.4조 (2024.05), 포스텔러 860만 누적 가입


---

## 18. 마케팅 페르소나

> MVP 단계에서는 페르소나를 1개로 좁혀 집중한다.

### 핵심 페르소나 — "사주에 질린 MZ 탐험가"

| 항목 | 내용 |
|---|---|
| 연령·성별 | 25~35세 여성 (70%) · 남성 (30%) |
| 직업 | 대학생 · 사회초년생 · 프리랜서 |
| 관심사 | 자기계발 · MBTI · 타로 · 사주 · 힐링 콘텐츠 |
| 페인 포인트 | "사주는 너무 뻔해, 새로운 거 없을까?" / "자미두수 들어봤는데 볼 수 있는 사이트가 없어" |
| 핵심 동기 | 새로운 자아탐색 도구 발견 · SNS 공유용 콘텐츠 확보 |
| 결제 성향 | 소액(1,900원 깊은풀이) 충동 결제 가능 · 무통장입금/카카오페이 선호 |
| 앱 사용 패턴 | 모바일 위주 · 인스타·틱톡·유튜브 숏츠 중심 |

**이 페르소나를 선택한 이유**

- 에브리타임·인스타 릴스로 비용 0원에 빠르게 접근 가능하고 공유 카드 바이럴이 자연스럽게 일어남
- 명반 생성·AI 해석·공유 카드가 이미 완성된 상태라 지금 당장 서비스 가능
- 1,900원 소액 충동 결제 성향으로 MVP 수익화 검증에 가장 적합

---

## 19. 채널 전략

### 19-1. 채널 우선순위

| 채널 | 목적 | 우선순위 | 예상 효과 |
|---|---|---|---|
| 에브리타임 | 대학생 직접 접근 · 입소문 | ★★★★★ | 고전환율 · 신뢰도 높음 |
| 인스타그램 릴스 | 공유 카드 바이럴 · 신규 유입 | ★★★★★ | 자발적 UGC 확산 |
| 네이버 블로그/카페 | SEO 트래픽 장기 확보 | ★★★★☆ | 검색 독점 가능 |
| 유튜브 숏츠 | 자미두수 입문 설명 · 브랜딩 | ★★★☆☆ | 신뢰도 구축 |
| 카카오톡 채널 | 재방문 유도 · 리텐션 | ★★★☆☆ | 이탈 방지 |

### 19-2. 채널별 실행 전략

#### ① 에브리타임 (★ 최우선)

> 비용 0원 · 높은 신뢰도 · 전환율 최상.

- 게시 위치: 자유게시판 / 대나무숲 / 연애게시판 (학교별 타겟팅)
- 콘텐츠 예시: "자미두수로 내 연애운 봤더니 소름돋음 ㄷㄷ" + 명반 공유 카드 첨부
- 확산 전략: 서울대·연대·고대 등 주요 10개 대학 게시판에 우선 게재
- 주의: 광고성 게시물로 보이지 않도록 자연스러운 후기 형식 유지

#### ② 인스타그램 릴스 & 공유 카드 (★ 최우선)

> 공유 카드(OG 이미지)를 활용한 자발적 바이럴 설계.

- 릴스 포맷: "내 자미두수 명반 뽑아봄 🔮" 15~30초 · 자막 + 배경음악
- 해시태그: #자미두수 #명반 #운세 #자미두수무료 #사주 #MBTI대신자미두수
- 인플루언서 협업: 운세/힐링 계정 (팔로워 1만~10만) 무료 명반 제공 후 후기 요청
- 스토리 공유 유도: 결과 화면에 "인스타 스토리 공유" 버튼 배치

#### ③ 네이버 블로그 & 카페 (SEO 핵심)

> 장기 검색 트래픽 확보. 26편 콘텐츠로 검색 독점 목표.

- 블로그 발행 계획: 14주성 시리즈 14편 + 12궁 시리즈 12편 = 26편
- 타겟 키워드: 자미두수(5K+) · 자미두수 명반(1.5K) · 자미두수 무료(1.2K)
- 카페 공략: 사주카페 · 역학카페 → "자미두수 무료로 뽑을 수 있는 사이트" 자연스럽게 공유
- 네이버 지식iN: "자미두수 보는 법" 질문에 서비스 링크 포함 답변 등록

#### ④ 유튜브 숏츠

- 숏츠 포맷: "자미두수란? 30초 설명" · "자미두수 vs 사주 차이"
- 사주·명리 유튜버에게 자미두수 명반 생성 도구로 협업 제안

#### ⑤ 카카오톡 채널 (리텐션)

- "친구 추가" CTA를 결과 화면 내 전략적 위치에 배치
- 메시지 주기: 주 1회 이내 · "이번 주 당신의 대운" 등 개인화 콘텐츠

---

## 20. GTM 6개월 로드맵

| 기간 | 핵심 활동 | 목표 KPI | 주요 채널 |
|---|---|---|---|
| M1 | 에브리타임 10개 대학 게재 · 인스타 계정 개설 · 네이버 블로그 5편 발행 | 가입자 500 · DAU 100 | 에브리타임 · 인스타 |
| M2 | SEO 26편 완성 · 릴스 10편 · 운세 인플루언서 5명 협업 | 가입자 2,000 · 검색 인덱스 30+ | 인스타 · 네이버 · 유튜브 |
| M3 | "내 명궁 챌린지" UGC 캠페인 · 공유 카드 디자인 고도화 | 가입자 5,000 · 공유 카드 1만 장 | 인스타 · 에브리타임 |
| M4 | Toss 결제 통합 · 프리미엄 7일 무료체험 · 카카오톡 채널 개설 | 유료 전환 3% · MRR 50만 | 카카오채널 · 인스타 광고 |
| M5 | 네이버 검색 광고 소규모 집행 · 연말 대운 캠페인 | 유료 전환 5% · MRR 150만 | 네이버 광고 · 카카오채널 |
| M6 | PRO 플랜 고도화 · 사주 유튜버 협찬 · 블로그 26편 완결 | MRR 200만 · 가입자 2만 | 전 채널 통합 |
