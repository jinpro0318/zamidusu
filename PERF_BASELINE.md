# 성능 기준선 (PERF_BASELINE)

최적화 **전(前)** main 브랜치의 성능 기준선. 변경 후 동일 방법으로 재측정해 비교한다.

## 측정 환경

| 항목 | 값 |
|---|---|
| 기준 커밋 | `c36b94f` (clean main, 최적화 변경은 stash 후 측정) |
| 실행 방식 | `npm run build && npm start` — **프로덕션 모드** (dev 아님) |
| 서버 | `http://localhost:3000` |
| 측정 도구 | Lighthouse 13.4.0 (`npx lighthouse`, headless Chrome) |
| Lighthouse 설정 | form factor: **mobile**, throttling: **simulate** (CPU 4x, RTT 150ms, 1638Kbps ≈ slow 4G) |
| 측정일 | 2026-06-19 |
| DB/Auth | 실제 Supabase 원격(원격 네트워크 지연 포함) |

> 참고: Lighthouse 기본값은 모바일 + 시뮬레이션 스로틀링이라 절대 시간은 데스크탑/고속망보다 크게 나온다. **변경 전후를 같은 설정으로 비교하는 상대값**으로 해석한다.

## 핵심 지표 (Before → After)

After = 최적화 변경(폰트 `preload:false`·깨진 latin subset 제거, recharts `next/dynamic` 분리, 인증 경로 정리) 적용 후, **동일 방법**(빌드→프로덕션 기동→Lighthouse 13.4.0 모바일·시뮬레이션 스로틀링)으로 재측정. After는 측정 노이즈 제거를 위해 **2회 측정 중 안정값** 사용(아래 "측정 노트" 참조).

| 페이지 | 지표 | **Before** | **After** | 변화 |
|---|---|---|---|---|
| **홈 `/`** | Perf 점수 | 74 | **91** | ▲ +17 |
| | FCP | 1.84s | 2.12s | +0.28s |
| | **LCP** | **22.94s** | **3.17s** | **▼ −86%** |
| | TBT | 52ms | 35ms | ▼ |
| | **woff2 요청 수** | **185개** | **6개** | **▼ −97%** |
| | **폰트 preload 링크** | **137개** | **0개** | **▼ −100%** |
| | 전송량 | 3,289KB | 348KB | ▼ −89% |
| | 총 요청 | 202 | 23 | ▼ |
| **결과 `/chart/[id]`** (게스트) | Perf 점수 | 69 | **70~71** | ≈ |
| | FCP | 2.41s | 4.08s | +1.67s (폰트 swap) |
| | **LCP** | **21.76s** | **5.28s** | **▼ −76%** |
| | TBT | 50ms | 0ms | ▼ |
| | **woff2 요청 수** | **195개** | **24개** | **▼ −88%** |
| | **폰트 preload 링크** | **137개** | **0개** | **▼ −100%** |
| | 전송량 | 3,505KB | 684KB | ▼ −80% |
| | 총 요청 | 212 | 41 | ▼ |
| **타임라인 `/chart/[id]/timeline`** | — | 측정불가(회원전용 307) | 측정불가(회원전용 307) | recharts 386KB 정적→`next/dynamic` 분리(빌드 확인) |
| **AI 채팅 `/api/ai/chat`** | — | 측정불가(회원전용 401) | 측정불가(회원전용 401) | DB 조회 병렬화·인증 세금 제거(로그인 측정 필요) |

### 측정 노트 (After 변동성)
- **홈**: 2회 측정 모두 Perf 91 / LCP 3.17~3.25s / woff2 6 / preload 0 — 일관됨.
- **결과 페이지**: 첫 측정에서 TBT 3151ms·Perf 41이 한 번 튀었으나, 재측정 2회 모두 **TBT 0ms·Perf 70~71·LCP 5.3s**로 수렴 → 첫 값은 **콜드 JS 컴파일 노이즈**로 판단해 안정값 채택.
- **결과 페이지 FCP가 소폭 상승(2.41→4.08s)**: 폰트 preload 제거로 첫 페인트가 폰트와 경쟁하지 않게 됐지만, 무거운 결과 화면(iztro payload·차트 렌더) 자체의 페인트 타이밍이 노출된 것. 핵심 지표인 **LCP는 21.8s→5.3s로 대폭 개선**되어 전체 체감은 크게 빨라짐.

> **기대값 검증 결과**: 폰트 preload **137 → 0** ✅, LCP **홈 −86% / 결과 −76%** ✅ — 정상 동작.

### 빌드 신뢰성 — 폰트 self-host로 해결 ✅
**문제(해결 전)**: `next/font/google`은 빌드 시 Nanum Myeongjo의 **전체 CJK subset 청크 276개**를 `fonts.gstatic.com`에서 받아 self-host했는데(`subsets` 값과 무관 — 생성 CSS가 전체 CJK 범위 포함), 그중 하나라도 타임아웃나면 `Module not found … turbopack-next/internal/font/google/font`로 빌드가 깨졌다(로컬에서 수 차례 재현). subsets/preload로는 해결 불가.

**해결**: `next/font/google` → **self-host 전환**.
- next/font가 받아두던 **276개 subset woff2를 `public/fonts/myeongjo/`** 로 그대로 이관(git 추적, ~4.1MB).
- 생성됐던 277개 `@font-face`(unicode-range 서브셋)를 로컬 경로(`/fonts/myeongjo/…`)로 재현한 **`app/fonts/myeongjo.css`** 작성 → `layout.tsx`에서 import. 변수 `--font-myeongjo`는 동 CSS의 `:root`에서 기존과 동일 값으로 정의(폴백 `Nanum Myeongjo Fallback` size-adjust 포함 → CLS 동일).
- 코드베이스에 `next/font/google` import **0건**(주석만 잔존).

**검증 결과**:
- **빌드**: 외부 폰트 fetch **완전 제거** — 빌드 로그 `gstatic`/`font/google/font` 참조 **0**, 2회 연속 빌드 성공(결정론적). (왜 안정적인가: 외부 fetch 자체가 코드에서 사라짐)
- **런타임(바이트 동일)**: 폰트가 전부 `/fonts/myeongjo/`에서 서빙(`_next/static/media` 0개), 로드 청크 수/용량 그대로.

| 페이지 | Perf | FCP | LCP | woff2 (소스) | preload | 전송량 |
|---|---|---|---|---|---|---|
| 홈 (self-host) | **91** | 2.13s | **3.18s** | 6 (전부 /fonts/myeongjo/) | **0** | 348KB |
| 결과 (self-host) | **70** | 4.13s | **5.48s** | 24 (전부 /fonts/myeongjo/) | **0** | 684KB |

→ google subset 단계(Perf 91·70 / LCP 3.17·5.28 / preload 0)와 **동일**. 한글 렌더도 그대로(시각적 회귀 없음).

> 재생성 절차: **`scripts/gen-local-font.js`** 참고. 폰트 갱신 시 layout.tsx를 임시로 next/font/google로 되돌려 1회 빌드(청크 다운로드) → `node scripts/gen-local-font.js` 실행(woff2 복사 + CSS 재생성) → self-host import로 복귀.

### recharts 코드 스플리팅 검증 (매니페스트)
Turbopack 빌드 로그는 라우트별 Size/First Load JS 컬럼을 출력하지 않아 **빌드 매니페스트로 검증**했다(런타임 JS 전송량으로 보완: 홈 200KB·결과 279KB 모두 recharts 미포함).
- recharts 청크 `0eh7hf7vsmu42.js`(**384KB**)가 **어느 라우트의 정적 client-reference에도 없음** ✅
- 오직 `/chart/[id]/timeline` 의 **`react-loadable-manifest.json`(= `next/dynamic` lazy)** 에만 존재 ✅
- 홈·결과 라우트 미참조 ✅ → recharts는 타임라인 진입 시에만 지연 로드되는 별도 청크로 분리됨(이전엔 timeline의 정적 client-reference에 포함되어 즉시 로드).

### 인프라 메모 (P1 리전 작업용)
- `.env`의 `DATABASE_URL` host: `aws-1-ap-northeast-2.pooler.supabase.com:6543`, `DIRECT_URL`: 동 host `:5432`.
- **Supabase 리전 = `ap-northeast-2` (서울)**, 이미 **pooler(PgBouncer) 사용 중**. → Vercel 함수 리전을 **`icn1`(서울)** 로 맞추면 교차리전 지연이 사라진다(현재 리전 미지정).

## 주요 병목 (베이스라인에서 관측)

1. **폰트가 첫 로딩을 지배** — 모든 페이지가 한글 명조체(`Nanum_Myeongjo`, `app/layout.tsx`)를 **유니코드 subset 청크 ~185개(약 3MB)** 로 내려받고, HTML `<head>`에 **`<link rel="preload" as="font">`를 137개** 삽입한다. 이 대량 프리로드가 네트워크를 포화시켜 스로틀링 환경에서 **LCP를 ~22초**까지 끌어올린다. (전체 전송량의 ~90%가 폰트)
2. **recharts 386KB가 타임라인 라우트에 정적 번들** — `3p4u4wvc8-5nj.js`(386KB) 청크는 `/chart/[id]/timeline` 라우트에만 연결돼 있으며(`page_client-reference-manifest.js`로 확인) 정적 import라 해당 라우트 진입 시 즉시 로드된다. 홈/결과 페이지 JS에는 포함되지 않음(라우트 특정).
3. **회원 전용 경로 측정 불가** — 타임라인·AI 채팅·깊은풀이는 로그인 세션이 필요해 비로그인/게스트로 Lighthouse 측정이 안 된다(아래 수동 측정법 참조).

## 회원 전용 경로 측정법 (변경 후 비교 시)

타임라인·AI 채팅 측정에는 **로그인 세션 + 명반 1개**가 필요하다. 권장 절차:

1. 프로덕션 서버 기동 후 실제 계정으로 로그인(이메일 또는 Google).
2. 명반 생성 → `/chart/[id]/timeline` 진입.
   - **타임라인**: Chrome DevTools Performance/Network로 LCP·recharts 청크(386KB) 로드 시점 기록. (변경 후엔 `next/dynamic`으로 분리되어 초기 critical path에서 빠져야 함)
   - **AI 채팅 응답**: 궁/깊은풀이 진입 시 `POST /api/ai/chat`의 **첫 토큰까지 시간(TTFB)** 과 **완료까지 시간**을 Network 탭에서 측정.
     - **캐시 히트**(이미 본 항목 재진입): 거의 즉시여야 함 — 베이스라인에선 `auth(getUser 네트워크) → chart 조회 → 구독 조회`가 직렬로 앞단에 쌓임.
     - **캐시 미스**(첫 생성): Gemini 스트리밍 지연(수 초)이 지배 — 모델 자체 시간이라 변경 후에도 유사.
3. 로그인 상태로 Lighthouse를 돌리려면 인증 쿠키를 `--extra-headers='{"Cookie":"..."}'`로 전달.

> 게스트 경로로 확인한 사실(참고): `/chart/[id]` 결과 페이지는 게스트 쿠키(`zmds_guest`)로 접근 가능해 측정에 사용했다. 타임라인은 307 리다이렉트, AI 채팅은 401로 게스트 차단됨.

## 재현 명령

```bash
# 1) 프로덕션 빌드 & 기동
npm run build && PORT=3000 npm run start

# 2) 홈 Lighthouse (모바일/시뮬레이션 스로틀링 = 기본값)
npx lighthouse http://localhost:3000/ --only-categories=performance \
  --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless=new"

# 3) woff2 요청 수 / 폰트 preload 링크 수
node -e 'const r=require("/tmp/lh-home.json").audits["network-requests"].details.items; \
  console.log("woff2:", r.filter(x=>/\.woff2/.test(x.url)).length)'
curl -s http://localhost:3000/ | grep -o '\''rel="preload"[^>]*as="font"'\'' | wc -l
```
