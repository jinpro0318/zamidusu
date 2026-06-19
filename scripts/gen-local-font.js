// Nanum Myeongjo self-host 재생성 스크립트.
//
// 배경: next/font/google은 빌드 시 fonts.gstatic.com에서 폰트 subset 청크를 받아 self-host하는데,
// CJK 폰트는 청크가 수백 개라 간헐적 네트워크 타임아웃으로 빌드가 깨졌다. 그래서 그 산출물을
// 리포지토리에 직접 호스팅(public/fonts/myeongjo/ + app/fonts/myeongjo.css)하도록 전환했다.
//
// 폰트를 갱신해야 할 때(weight 추가/버전업 등):
//   1) app/layout.tsx에서 임시로 next/font/google(Nanum_Myeongjo, preload:false)로 되돌려 1회 빌드
//      → .next/static/media 에 최신 subset woff2가 받아진다.
//   2) 이 스크립트를 실행: node scripts/gen-local-font.js
//      → @font-face가 들어있는 빌드 CSS 청크를 찾아, woff2를 public/fonts/myeongjo/로 복사하고
//        url을 로컬 경로로 치환한 app/fonts/myeongjo.css를 재생성한다.
//   3) layout.tsx를 self-host(import "./fonts/myeongjo.css")로 되돌린다.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MEDIA_DIR = path.join(ROOT, ".next/static/media");
const CHUNKS_DIR = path.join(ROOT, ".next/static/chunks");
const OUT_FONT_DIR = path.join(ROOT, "public/fonts/myeongjo");
const OUT_CSS = path.join(ROOT, "app/fonts/myeongjo.css");
const FAMILY = "Nanum Myeongjo";

// @font-face(해당 family)가 들어있는 빌드 CSS 청크를 자동 탐색
const cssFile = fs
  .readdirSync(CHUNKS_DIR)
  .filter((f) => f.endsWith(".css"))
  .map((f) => path.join(CHUNKS_DIR, f))
  .find((p) => fs.readFileSync(p, "utf8").includes(`font-family:${FAMILY}`));

if (!cssFile) {
  console.error(`@font-face(${FAMILY})를 가진 빌드 CSS를 찾지 못했습니다. 먼저 next/font로 1회 빌드하세요.`);
  process.exit(1);
}

const css = fs.readFileSync(cssFile, "utf8");
const faces = (css.match(/@font-face\{[^}]*\}/g) || []).filter((f) => f.includes(FAMILY));
console.log(`소스 CSS: ${path.relative(ROOT, cssFile)} | myeongjo @font-face: ${faces.length}`);

const used = new Set();
const rewritten = faces.map((f) =>
  f.replace(/url\(\.\.\/media\/([^)]+\.woff2)\)/g, (_, file) => {
    used.add(file);
    return `url(/fonts/myeongjo/${file})`;
  })
);

fs.mkdirSync(OUT_FONT_DIR, { recursive: true });
let copied = 0;
for (const file of used) {
  const src = path.join(MEDIA_DIR, file);
  if (!fs.existsSync(src)) {
    console.error("누락:", file);
    continue;
  }
  fs.copyFileSync(src, path.join(OUT_FONT_DIR, file));
  copied++;
}

fs.mkdirSync(path.dirname(OUT_CSS), { recursive: true });
const header =
  "/* 자동 생성: scripts/gen-local-font.js — next/font/google 산출물(@font-face + woff2)을 self-host로 이관.\n" +
  "   빌드 시 외부(fonts.gstatic.com) fetch 0. 런타임은 preload 없이 unicode-range 서브셋 청크만 지연 로드(display:swap). */\n";
const rootVar = `:root{--font-myeongjo:"${FAMILY}","${FAMILY} Fallback"}\n`;
fs.writeFileSync(OUT_CSS, header + rewritten.join("\n") + "\n" + rootVar);

let bytes = 0;
for (const file of used) bytes += fs.statSync(path.join(OUT_FONT_DIR, file)).size;
console.log(`woff2 복사: ${copied}/${used.size} | CSS: ${path.relative(ROOT, OUT_CSS)} | 폰트 총량: ${Math.round(bytes / 1024)}KB`);
