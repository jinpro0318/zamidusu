// share/kakao.ts — Kakao "친구에게 공유" helpers + 실제 공유 링크
//
// 동작 조건:
//   1) app/layout.tsx 에서 Kakao JS SDK <Script> 로드 (window.Kakao 주입)
//   2) NEXT_PUBLIC_KAKAO_JS_KEY (JavaScript 키) 설정
//   3) 카카오 developers → 플랫폼 → Web 사이트 도메인 등록 (localhost / 배포 도메인)
// 키/SDK 가 없으면 데모 토스트로 폴백.

// window.Kakao 타입 (ShareButton.tsx에서 이전).
declare global {
  interface Window {
    Kakao?: any;
  }
}

type ShowToast = (msg: string) => void;

interface ShareMeta {
  /** 공유 카드 제목 (예: 명반 주인 이름) */
  title?: string;
  /** 命宮 주성 (한자) — 설명 문구에 사용 */
  soulStars?: string[];
}

let kakaoReady = false;
// chartId → 발급된 공유 URL 캐시 (중복 토큰 발급 방지)
const urlCache = new Map<string, string>();

/** Initialize the Kakao SDK once, if it's loaded and a key is configured. */
export function initKakao(): void {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const Kakao = typeof window !== 'undefined' ? window.Kakao : undefined;
  if (!Kakao || !key || kakaoReady) return;
  try {
    if (!Kakao.isInitialized()) Kakao.init(key);
    kakaoReady = true;
  } catch {
    /* ignore */
  }
}

/**
 * 명반 공유 토큰을 발급(또는 재사용)받아 실제 공유 URL을 반환.
 * 서버가 chart.shareToken 을 만들고 shareEnabled=true 로 표시한다.
 */
export async function getShareUrl(chartId: string): Promise<string | null> {
  if (urlCache.has(chartId)) return urlCache.get(chartId)!;
  try {
    const res = await fetch(`/api/charts/${chartId}/share`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok || !data.shareToken) throw new Error(data.error ?? 'share token 발급 실패');
    const url = `${window.location.origin}/share/${data.shareToken}`;
    urlCache.set(chartId, url);
    return url;
  } catch (err) {
    console.error('[share/kakao] getShareUrl 실패', { chartId, err });
    return null;
  }
}

function fallbackCopy(txt: string, done?: () => void): void {
  try {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    /* ignore */
  }
  done?.();
}

export async function copyLink(chartId: string, showToast: ShowToast): Promise<void> {
  const url = await getShareUrl(chartId);
  if (!url) {
    showToast('공유 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요');
    return;
  }
  const done = () => showToast('링크를 복사했어요');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
  } else {
    fallbackCopy(url, done);
  }
}

export async function shareKakao(chartId: string, meta: ShareMeta, showToast: ShowToast): Promise<void> {
  initKakao();
  const Kakao = typeof window !== 'undefined' ? window.Kakao : undefined;

  // SDK/키 미설정 → 데모 폴백 (기존 동작 유지)
  if (!Kakao?.Share || !Kakao.isInitialized?.()) {
    showToast('카카오톡 공유 (데모) · JS키·도메인 연결 시 카톡으로 전송돼요');
    return;
  }

  const url = await getShareUrl(chartId);
  if (!url) {
    showToast('공유 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요');
    return;
  }

  // OG 라우트는 chart.id / shareToken 둘 다 허용 → 토큰으로 미리보기 이미지 생성
  const token = url.split('/share/')[1] ?? chartId;
  const soul = meta.soulStars && meta.soulStars.length > 0 ? meta.soulStars.join('·') : '空宮';
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${meta.title ? `${meta.title}님의 ` : '내 '}자미두수 명반`,
        description: `명궁 ${soul} — 내 명반과 12 영역 해석을 확인해보세요`,
        imageUrl: `${window.location.origin}/api/og/chart/${token}`,
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        { title: '명반 보러가기', link: { mobileWebUrl: url, webUrl: url } },
      ],
    });
    showToast('카카오톡으로 공유합니다');
  } catch (err) {
    console.error('[share/kakao] sendDefault 실패', err);
    showToast('카카오톡 공유에 실패했어요');
  }
}
