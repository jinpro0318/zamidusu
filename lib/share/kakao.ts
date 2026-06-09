// share/kakao.ts — Kakao "친구에게 공유" helpers + share link
//
// To enable real Kakao sharing:
//   1) Uncomment the Kakao JS SDK <script> in index.html
//   2) Set VITE_KAKAO_JS_KEY in a .env file
//   3) Register your Web domain at developers.kakao.com
// Without a key it falls back to a demo toast.

// demo share link (backend share_token based URL — 기획서 GET /charts/share/{token})
export const SHARE_URL = 'https://jami.app/c/8f3a2b9d';

type ShowToast = (msg: string) => void;

let kakaoReady = false;

/** Initialize the Kakao SDK once, if it's loaded and a key is configured. */
export function initKakao(): void {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const Kakao = window.Kakao;
  if (!Kakao || !key || kakaoReady) return;
  try {
    if (!Kakao.isInitialized()) Kakao.init(key);
    kakaoReady = true;
  } catch {
    /* ignore */
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

export function copyLink(showToast: ShowToast): void {
  const done = () => showToast('링크를 복사했어요');
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(SHARE_URL)
      .then(done)
      .catch(() => fallbackCopy(SHARE_URL, done));
  } else {
    fallbackCopy(SHARE_URL, done);
  }
}

export function shareKakao(showToast: ShowToast): void {
  try {
    const Kakao = window.Kakao;
    if (Kakao?.Share && Kakao.isInitialized?.()) {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '내 자미두수 명반이 완성됐어요',
          description: '명궁 紫微·天府 — 내 명반과 12 영역 해석을 확인해보세요',
          imageUrl: 'https://jami.app/og/chart.png',
          link: { mobileWebUrl: SHARE_URL, webUrl: SHARE_URL },
        },
        buttons: [
          { title: '명반 보러가기', link: { mobileWebUrl: SHARE_URL, webUrl: SHARE_URL } },
        ],
      });
      showToast('카카오톡으로 공유합니다');
    } else {
      showToast('카카오톡 공유 (데모) · JS키 연결 시 카톡으로 전송돼요');
    }
  } catch {
    showToast('카카오톡 공유 (데모)');
  }
}
