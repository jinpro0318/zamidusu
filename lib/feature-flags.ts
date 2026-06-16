// lib/feature-flags.ts — 런타임 기능 플래그.

// 테스트 기간: 비로그인도 상세 풀이를 실제로 열람 가능하게 임시 개방.
// 잠금(🔒) 표시는 "로그인 기능 표시"용으로 유지한다.
// 정식 로그인 게이팅으로 되돌리려면 false 로 바꾸면 카드·모달 모두 일괄 적용된다.
export const TEST_DETAIL_OPEN = true;
