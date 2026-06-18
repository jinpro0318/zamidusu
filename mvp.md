# 자미두수(紫微斗數) MVP 기획서

> **포지션**: 한국 최초의 **자미두수 단일 특화 + AI 대화형 해석 + 모던 모바일-퍼스트 UX** 운명분석 웹서비스
> **한 줄 요약**: "사주 다음은 자미두수." — 로그인 없이 1초 만에 만드는 내 명반, AI가 옆에서 상담하듯 풀어주는 12궁, 인스타로 공유하는 우주.

기획서 명세를 **Next.js 16 풀스택**으로 구현했고, 경쟁(포스텔러·헬로우봇)과 차별화되는 **AI 대화형 풀이 + 자미두수 단일 특화 + 모던 UX + 단건 결제 수익화**를 결합했다.

---

## 1. 시장 진단

### 1-1. 한국 점술/운세 시장
- 시장 규모: **약 1.4조 원**(2024 한경 산업 추정)
- MZ 1인당 연 운세 지출: **80,300원**
- 포스텔러: 누적 **860만 가입자**, 헬로우봇: 500만 가입자
- 청년 시장 70% 이상이 모바일·앱으로 전환

### 1-2. 자미두수 영역의 공백
| 관점 | 현황 | 시사점 |
|---|---|---|
| 검색량 | "자미두수" 월 5,000+, "자미두수 명반" 1,500+, long-tail 합산 월 15,000+ | 수요는 견고 |
| 한국 단일 특화 사이트 | 거의 부재(대만/홍콩 중국어 사이트, 또는 사주 종합의 보너스 메뉴) | 카테고리 디자인 기회(블루오션) |
| 페르소나 | 명리 심화 유저 + 사주에 실증난 MZ + 자미두수 학습자 | 다층 타겟 |

> 자미두수는 **검색 수요는 있고 공급은 약한** 영역. 단일 특화 모던 웹서비스로 SEO 트래픽을 거의 독점 가능하고, 프리미엄 해석 결제로 수익화가 가능하다.

---

## 2. 핵심 차별점

| # | 차별점 | 경쟁사 | 우리의 구현 |
|---|---|---|---|
| 1 | **AI 대화형 명반 해석** | 정적 텍스트 / 보고서식 | Gemini 2.5 + 내 명반 컨텍스트 주입, **옆에서 상담하듯 한 편의 글**(호칭·공감·마음읽기·응원), 결과 캐싱(재방문 0초) |
| 2 | **12궁 전체 풀이 + 추천 질문 칩** | 거의 부재 | 12궁을 가로지르는 종합 풀이 + "올해 일/연애/재물" 칩으로 이어 묻기 |
| 3 | **궁합 분석(두 명반 비교)** | 자미두수 궁합 희소 | 자체 점수 알고리즘(지지 6합·사화 충돌·오행국 상생) |
| 4 | **모바일-퍼스트 UX + 공유 카드** | 구형 디자인 | 480px 반응형 컬럼, 자색·금색 + Nanum Myeongjo, 인스타·카톡 OG 자동 생성 |
| 5 | **대운·세운 타임라인 + 월간 운세** | 텍스트 나열 | Recharts 점수 그래프(라이트 테마) + 시기별 AI 흐름 분석 + 이번 달 운세 |

---

## 3. AI 풀이 — 대화형 상담 톤 (핵심 차별점)

모든 명반 해석(궁별 상세풀이·12궁 전체 풀이·월간 운세·대운 흐름)은 **옆에서 상담해주듯 흐르는 한 편의 글**로 답한다. 공통 규칙은 `lib/ai/prompt-builder.ts`의 `CONSULT_STYLE` 상수가 단일 출처.

**답변 구조(4박자, 자연스러운 문단 흐름):**
1. **도입 공감** — 지금의 맥락(나이/인생 단계 + 해당 궁/분야 주제)을 짚는 1~2문장
2. **마음 읽기** — "혹시 요즘 ~한 고민 있으신가요?"처럼 마음을 먼저 헤아리는 질문 1개
3. **본문** — 명반 근거(주성·사화·밝기·궁의 자리)를 쉬운 말로, 곁에서 조언하듯
4. **응원/제안** — 따뜻한 마무리 1문장

**규칙:**
- 이름이 있으면 **"○○ 님"** 으로 부르며 시작(없으면 자연스럽게 생략)
- **궁별 상세풀이**는 글 맨 앞에서 **이 자리(궁)와 별을 한자로 먼저 짚어 설명**("이 자리는 관록궁(官祿宮), 일·성취를 보는 자리예요 / 여기엔 태양(太陽)이라는 밝게 베푸는 별이 있어요")한 뒤, 이어서 대화형 풀이로 — **왜 이 한자가 나왔고 무슨 뜻인지**를 탭 없이도 글만 읽으면 이해되게.
- 대괄호 머리글·마크다운 제목·목록·`[[..]]` 토큰·코드 토큰을 **출력하지 않음**(자연스러운 문단만)
- 한자는 "한글(한자) — 쉬운 풀이"로 본문에 흡수. 별 이름·한자·밝기는 `lib/star-names.ts` 단일 소스 주입값만 사용(임의 생성 금지)
- 단정·공포 금지(가능성·경향으로), 이모지 0~1개, 공궁(空宮)은 결핍이 아닌 "유연함"으로 긍정 해석

**추천 질문 칩(이어 묻기):**
- 궁별 상세풀이·12궁 전체 풀이 하단에 1인칭 추천 칩(올해 일/연애/재물 등). 탭하면 같은 AI 스트림으로 짧은 후속 풀이를 이어서 보여줌(기존 호출/캐시 재사용). 모바일 우선, 칩은 줄바꿈(flex-wrap)으로 잘림 없이 노출.

---

## 4. 기능 목록

| 기능 | 경로 | 접근 | 설명 |
|---|---|---|---|
| 무료 12궁 요약 | `/chart/[id]` | 누구나 | 정적 요약 + 명반 차트 + 추천 칩 |
| 궁별 상세풀이(AI) | `/chart/[id]/palace/[key]` | 로그인 | 한자 근거→대화형 풀이 + 추천 칩 + 이어 묻기 |
| 12궁 전체 풀이(AI) | `/chart/[id]/deep` | 로그인 | 12궁을 가로지르는 종합 + 추천 칩 + 이어 묻기 |
| 대운·세운 타임라인 | `/chart/[id]/timeline` | 로그인 | Recharts 점수 그래프 + 연령대별 AI 흐름 분석 |
| 월간 운세 | `/chart/[id]/monthly` | 로그인 | 이번 달 흐름(달마다 새로 캐시) |
| 궁합 분석 | `/compatibility` | 로그인 | 두 명반 비교 점수 + AI 관계 풀이 |
| 공유 카드 | `/share/[token]` | 공개 | OG 이미지(1200×630) |

> **현재 테스트 기간(시연)**: 결과 화면 "내게 맞는 더 깊은 풀이" 섹션은 제목 옆에 **"유료 회원 전용" 배지**를 달고, 4개 카드(전체풀이·타임라인·궁합·월간)는 금액 없이 **"보기 →"** 만 노출한다. 카드를 누르면 **890원 결제 팝업(무통장입금 안내)** 이 뜨고, "결제 확인하고 보기"를 누르면 해당 기능이 열린다. 체험 단계라 실제 입금/검증은 생략(`onConfirm` 데모 경로). 결제 구조(`Purchase` 모델·`DepositSheet`)는 구현돼 있어 정식 전환 시 `POST /api/purchase`(PENDING) + 서버 게이트(`hasPurchased`)를 복구한다.

---

## 5. 가격 정책 (수익 구조)

명반(chart) 1개 단위의 프리미엄 풀이 **단건 잠금해제**가 수익 모델. PG 연동 전 단계로 **무통장입금(수동 계좌이체) + 관리자 입금확인**을 받고, 추후 토스 자동결제로 확장할 수 있게 구조(`Purchase.method`)를 남겨둔다.

| 콘텐츠 | 가격 | 접근(정식 전환 시) |
|---|---|---|
| 무료 12궁 요약 | 0원 | 누구나 |
| 궁별 상세풀이(AI) | 0원 | 로그인 회원 |
| 프리미엄 풀이(전체풀이·타임라인·월간·궁합) | **890원** | 결제(PAID) — chart 1개 영구 잠금해제 |

**결제 흐름(무통장입금):** 잠금 카드 탭 → 무통장입금 모달(계좌 표시 + 입금자명 입력) → `POST /api/purchase` → `Purchase{status:PENDING}` → 관리자 입금 확인 → `status=PAID` → 잠금 해제. 계좌정보는 서버 env(`BANK_*`)에서 읽음.

**향후:** `@tosspayments/tosspayments-sdk`(설치됨) + `Purchase.method="TOSS"`로 자동결제 전환. 구독제(`Subscription`/`lib/entitlements.ts`)로 "구독자 전체 열람" 확장.

---

## 6. 기술 스택 & 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router · Turbopack) + React 19 + TS 5       │
├──────────────────────────────────┬──────────────────────────┤
│  UI: 인라인 style + Tailwind v4   │  자색·금색 디자인 토큰    │
│                                   │  (theme/tokens.ts)        │
│  Auth: Supabase Auth (Kakao 등)   │  + lib/guest.ts 게스트    │
│  DB: Prisma 6 + Supabase Postgres │  pooler(6543)/direct(5432)│
│  명반 엔진: iztro v2.5.8 (ko-KR)  │  30분 보정 시진 매핑      │
│  AI: AI SDK v4 + @ai-sdk/google   │  Gemini 2.5 (플랜별)      │
│  AI 톤: CONSULT_STYLE 대화형      │  star-names.ts 단일 소스  │
│  AI 캐싱: PalaceReading/DeepReading│ 버전 키 + thinking-off   │
│  결제: 무통장입금 + Purchase 모델 │  @tosspayments(향후)      │
│  공유 카드: @vercel/og            │  ImageResponse 1200×630   │
│  타임라인: Recharts (라이트 테마) │  대운 점수 그래프         │
│  배포: Vercel + Supabase          │                           │
└──────────────────────────────────┴──────────────────────────┘
```

**반응형 풀-블리드 레이아웃**(`app/layout.tsx`): 모바일은 viewport 전체, 데스크탑/태블릿은 중앙 정렬 **480px 고정폭 컬럼**. 컬럼에 `transform: translateZ(0)` → `position: fixed` 시트가 컬럼에 attach. 내부 스크롤 컨테이너(`data-scroll-root`)가 본문 스크롤 담당. 데스크탑 컬럼 양옆 여백은 `FrameBackground`(라우트별)로 크림 화면에선 크림, 다크 화면에선 다크로 칠해 이음새 제거.

---

## 7. 디렉토리 구조

```
app/
├─ page.tsx                          # 랜딩 (/)
├─ layout.tsx                        # 480px 반응형 컬럼 + 고객센터 위젯
├─ sign-in·login·auth/callback       # Supabase Auth UI / 알리아스 / OAuth 콜백
├─ mypage/{page,client}.tsx          # 마이페이지 (로그인 필요)
├─ chart/
│  ├─ new/{page,client}.tsx          # 출생정보 입력 폼(정확 시각·관계·불확실 배지)
│  └─ [id]/
│      ├─ {page,client}.tsx          # 결과 화면(명반 차트 + 12영역 + 추천 칩 + 프리미엄)
│      ├─ palace/[key]/{page,client} # 궁별 상세풀이 (로그인)
│      ├─ deep/{page,client}.tsx     # 12궁 전체 풀이 (로그인)
│      ├─ timeline/page.tsx          # 대운·세운 타임라인 (Recharts, 라이트)
│      └─ monthly/{page,client}.tsx  # 월간 운세 (로그인)
├─ compatibility/{page,form,[id]}    # 궁합
├─ share/[token]/page.tsx            # 공개 공유 페이지
└─ api/
   ├─ charts/…                       # 명반 CRUD + 공유 토큰
   ├─ ai/chat/route.ts               # Gemini 스트리밍 + 캐시 + 모드(궁별/deep/timeline/monthly)
   ├─ compatibility·purchase·feedback·og/chart
components/
├─ ziwei/screens/{Input,Result,Detail,DeepReadingScreen,MonthlyScreen,Mypage}.tsx
├─ ziwei/{Plate,UncertainTimeBadge,SavedChartsSheet}.tsx · premium/PremiumSection.tsx
├─ ai/AiText.tsx                     # 본문 렌더(마크업·hanja 보정)
├─ timeline/{DecadalTimeline,TimelineAnalysis}.tsx
├─ support/SupportWidget.tsx         # 고객센터 위젯(차트 페이지 한정)
lib/
├─ iztro/{generate,horoscope,compatibility,to-areas,types}.ts
├─ ai/{gateway,prompt-builder,guardrails}.ts · star-names.ts
├─ {auth,db,entitlements,guest,purchase,share-token}.ts
data/{areas,areaInfo,questions,sijin}.ts
prisma/schema.prisma · middleware.ts
```

---

## 8. 데이터 모델 (Prisma)

**datasource**: `url`=Supabase Transaction Pooler(6543, `?pgbouncer=true&connection_limit=1` 필수), `directUrl`=직결(5432, 마이그레이션).

핵심 엔티티:
- **User** — Supabase Auth user.id = Prisma User.id(`auth()` upsert 동기화)
- **Chart** — `payload`(iztro 산출물 JSON) + `iztroVersion` + `shareToken` + `timeUncertain`(출생시간 불확실) + `relation`(본인/가족/지인 등 분류)
- **Purchase** — chart 단건 구매. `userId+chartId` unique, `amount`(890), `method`("BANK_TRANSFER"→향후 "TOSS"), `status`(PENDING/PAID/CANCELLED). 결제 게이트의 단일 근거(`lib/purchase.ts`)
- **PalaceReading** — 궁별 풀이 캐시. `(chartId, palaceKey, modelVersion, promptVersion)` unique
- **DeepReading** — 전체풀이/타임라인/월간 캐시. `(chartId, section, modelVersion, promptVersion)` unique. `section`은 `"all"` / `"timeline"` / `"monthly-YYYY-MM"`
- **Subscription / Payment** — 향후 구독·PG
- **AiConversation / AiDailyUsage / Feedback / Compatibility**

> AI 결과 캐시는 **버전 키 설계**(`modelVersion`+`promptVersion`) — 프롬프트/모델 개선 시 `PROMPT_VERSION` 한 단계 올리면 옛 캐시가 자동 무효화·재생성된다(현재 v6).

---

## 9. 기능 구현 디테일

### 9-1. AI 명반 해석 (`app/api/ai/chat/route.ts`, `lib/ai/*`)
- Vercel AI SDK v4 `streamText` + Gemini 2.5 (FREE `flash-lite` / PREMIUM `flash` / PRO `pro`, `lib/ai/gateway.ts`)
- 모드별 시스템 프롬프트: 궁별(`buildSystemPrompt`) / 전체풀이(`buildDeepReadingPrompt`) / 대운 흐름(`buildTimelinePrompt`) / 월간(`buildMonthlyPrompt`) / 궁합(`buildCompatPrompt`). 모두 `CONSULT_STYLE` 대화형 톤(§3)
- 도입부 공감용 **나이 힌트**(`birthYear` 기반)를 프롬프트에 주입
- **캐싱·가속**: 초기 풀이는 해당 캐시 테이블에 저장 → 재방문 시 LLM 호출 없이 동일 스트림 즉시 반환. 초기 풀이엔 `thinkingConfig.thinkingBudget=0` + `maxTokens`로 첫 토큰(TTFB) 단축. 후속 자유질문은 기본값
- **가드레일**(`lib/ai/guardrails.ts`): 운명론 단정·의학/법률/금융 단정·차별 표현 거부
- 로그인 회원 무제한, 비로그인 401

### 9-2. 궁합 분석 (`lib/iztro/compatibility.ts`)
점수 0-100, 카테고리 love(0.5)/work(0.3)/family(0.2). 룰: 명궁 지지 6합 +20/6충 −15, 부처궁↔상대 명궁 주성 호환, 사화 화기/화록궁, 오행국 상생/상극.

### 9-3. 모바일 UX + 공유 카드
`@vercel/og` `ImageResponse`로 1200×630 PNG. OG 라우트는 `id` OR `shareToken` 허용. 카카오 공유(`lib/share/kakao.ts`).

### 9-4. 대운·세운 타임라인 + 월간 운세
- 타임라인: Recharts `LineChart`(x축 10년 대운, y축 길/흉성·사화 가중 점수, 현재 나이 하이라이트). **라이트 테마**(흰 카드·바이올렛 라인). 아래 "연령대별 흐름 분석"은 mode:timeline AI
- 월간 운세: mode:monthly로 이번 달 흐름 생성, `section="monthly-YYYY-MM"`으로 **달마다 새 캐시**

### 9-5. 입력 폼 (`/chart/new`)
시진 선택 + **정확한 시각 직접 입력**(HH:MM → 30분 보정 시진 자동 매핑, 경계 안내) + 시간 모름/추정 시 명반·풀이 상단 **"참고용 해석" 배지** + **관계 분류**(본인/가족/친구·지인/연인/기타).

### 9-6. 3단계 서버 권한 (정식 전환 시)
UI 숨김이 아닌 **서버 강제**. 단일 chokepoint `lib/purchase.ts` `hasPurchased(userId, chartId)`.
| 층 | 콘텐츠 | 규칙 |
|---|---|---|
| 무료 | 12궁 요약 | 누구나 |
| 로그인 | 궁별 상세풀이 | 세션 필수 |
| 결제 | 프리미엄 풀이 | `hasPurchased`(PAID) |

---

## 10. 명반 계산 엔진 — iztro 통합
오픈소스 **iztro v2.5.8**(MIT, TypeScript) 사용. 양/음력 자동 변환, 12궁·14주성·보좌성·사화 배치, 대운/유년 `horoscope(date)`, `"ko-KR"` 로케일. 한국 시간 → 시진 변환(30분 보정, `data/sijin.ts`). 회귀 테스트 `tests/iztro.spec.ts`(vitest).

---

## 11. 인증 · 게스트 · 결제
- **Supabase Auth**: Kakao OAuth + 이메일 magic link. `lib/auth.ts` `auth()`가 `{user:{id,email,name}}` 형태 반환(기존 시그니처 유지). 첫 로그인 시 Prisma User upsert
- **게스트**(`lib/guest.ts`): `zmds_guest` httpOnly 쿠키. 비로그인도 명반 생성·저장
- **로그인 복귀**: 모든 게이트가 `?next=` 쿼리로 복귀 경로 보존
- **결제**: `POST /api/purchase`(회원·소유권 검증, 항상 PENDING — status는 클라이언트가 못 정함). `DepositSheet` 바텀시트(계좌 env + 입금자명 + 복사 버튼)
- **권한 단일 출처**: `lib/purchase.ts`(결제 게이트), `lib/entitlements.ts`(플랜별 model/maxCharts)

---

## 12. 견고성 · 접근성
- **친절 에러**(`app/api/charts/route.ts`): 전 핸들러 try/catch → JSON 응답. iztro 영문 에러를 한글로 번역, Prisma 코드(P2002/P2025/…) 한글 매핑, 내부 stack 비노출
- **접근성**: 네비 `<Link>`, 동작 `<button aria-label>`, Plate 셀 `aria-pressed`, `:focus-visible` 골드 outline, 커스텀 404(WCAG AAA)
- **라우트 견고성**(`use-nav.ts`): chartId 없는 호출 `"/"` 폴백

---

## 13. SEO & 마케팅
- **키워드**: 1차 — 자미두수(5K+)·자미두수 명반(1.5K)·자미두수 무료(1.2K). 2차 long-tail — 자미두수 대운/궁합/12궁/vs 사주
- **콘텐츠(계획)**: 14주성 14편 + 12궁 12편 = 26편 블로그(ISR)
- **인프라**: `app/sitemap.ts`(공개 `/share/[token]` 포함), `app/robots.ts`(`/mypage`·`/chart/*`·`/api/*` Disallow). Naver/Google Search Console, 구조화 데이터(계획)

---

## 14. 리스크 & 완화
| 리스크 | 완화 |
|---|---|
| 자미두수 시장이 작다 | 사주 보조 키워드 유입 + "자미두수 vs 사주" 비교 콘텐츠로 카테고리 교육 |
| iztro 학파 이견 | 디스클로저: "오픈소스 엔진·일부 학파와 다를 수 있음" |
| AI 환각·점술 윤리 | 가드레일 + 운명론/의료/법률/금융 단정 금지 |
| 결제 분쟁 | 7일 환불 보장, Toss 표준 약관 준수 |
| Pooler prepared statement 충돌 | `?pgbouncer=true&connection_limit=1` + `directUrl` 분리 |

---

## 15. 부트스트랩 & 검증

```bash
npm install
npx prisma generate
npx prisma db push      # Supabase Postgres 스키마 반영 (DIRECT_URL)
npm run dev
```

**골든 패스:** 랜딩 → `/chart/new`(양력 1990-05-20 07:00 辰時 남) → `/chart/[id]` 결과 → 궁별 상세풀이(한자 근거→대화형 풀이) → 추천 칩으로 이어 묻기 → 12궁 전체 풀이 → 타임라인/월간 → 공유 토큰 → 궁합.

**주요 env**: `DATABASE_URL`/`DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_KAKAO_JS_KEY`, `BANK_NAME`/`BANK_ACCOUNT`/`BANK_HOLDER`, `NEXT_PUBLIC_TOSS_CLIENT_KEY`/`TOSS_PAYMENTS_SECRET_KEY`(향후). `NEXT_PUBLIC_*`은 변경 시 재배포 필수.

---

## 16. 마케팅 페르소나

> MVP 단계에서는 페르소나를 1개로 좁혀 집중.

### 핵심 페르소나 — "사주에 질린 MZ 탐험가"
| 항목 | 내용 |
|---|---|
| 연령·성별 | 25~35세 여성(70%)·남성(30%) |
| 직업 | 대학생 · 사회초년생 · 프리랜서 |
| 관심사 | 자기계발 · MBTI · 타로 · 사주 · 힐링 콘텐츠 |
| 페인 포인트 | "사주는 뻔해, 새로운 거 없을까?" / "자미두수 볼 수 있는 사이트가 없어" |
| 핵심 동기 | 새로운 자아탐색 도구 · SNS 공유 콘텐츠 |
| 결제 성향 | 890원 소액 충동 결제 · 무통장입금/카카오페이 선호 |
| 사용 패턴 | 모바일 위주 · 인스타·틱톡·숏츠 |

**선택 이유**: 에브리타임·인스타 릴스로 비용 0원 접근, 공유 카드 바이럴 자연 발생. 명반 생성·AI 해석·공유 카드가 완성돼 즉시 서비스 가능. 890원 소액 충동 결제로 수익화 검증에 적합.

---

## 17. 채널 전략

| 채널 | 목적 | 우선순위 |
|---|---|---|
| 에브리타임 | 대학생 직접 접근·입소문 | ★★★★★ |
| 인스타그램 릴스 | 공유 카드 바이럴 | ★★★★★ |
| 네이버 블로그/카페 | SEO 장기 트래픽 | ★★★★☆ |
| 유튜브 숏츠 | 입문 설명·브랜딩 | ★★★☆☆ |
| 카카오톡 채널 | 재방문·리텐션 | ★★★☆☆ |

- **에브리타임**: 자유/연애 게시판에 자연스러운 후기 형식("자미두수로 연애운 봤더니 ㄷㄷ" + 공유 카드)
- **인스타 릴스**: "내 자미두수 명반 뽑아봄 🔮" 15~30초, #자미두수 #명반 #MBTI대신자미두수, 운세 인플루언서(1만~10만) 협업
- **네이버**: 26편 SEO 콘텐츠 + 역학 카페/지식iN 공략
- **유튜브 숏츠 / 카카오 채널**: "자미두수 vs 사주" 설명, 주 1회 개인화 메시지

---

## 18. GTM 6개월 로드맵

| 기간 | 핵심 활동 | 목표 KPI |
|---|---|---|
| M1 | 에브리타임 10개 대학·인스타 개설·블로그 5편 | 가입자 500·DAU 100 |
| M2 | SEO 26편·릴스 10편·인플루언서 5명 협업 | 가입자 2,000·인덱스 30+ |
| M3 | "내 명궁 챌린지" UGC·공유 카드 고도화 | 가입자 5,000·공유 1만 장 |
| M4 | Toss 결제 통합·프리미엄 7일 체험·카카오 채널 | 유료 전환 3%·MRR 50만 |
| M5 | 네이버 검색 광고·연말 대운 캠페인 | 유료 전환 5%·MRR 150만 |
| M6 | PRO 플랜·유튜버 협찬·블로그 완결 | MRR 200만·가입자 2만 |

---

## 19. 출처
- iztro: https://github.com/SylarLong/iztro (`ko-KR` 로케일 공식 지원)
- Supabase: https://supabase.com/docs/guides/auth
- Vercel AI SDK: https://sdk.vercel.ai/docs (`@ai-sdk/google` Gemini)
- Toss Payments: https://docs.tosspayments.com
- Prisma + PgBouncer: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
- 시장: 한경 점술 시장 1.4조(2024.05), 포스텔러 860만 누적 가입
