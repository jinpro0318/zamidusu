// NextAuth는 제거되고 Supabase Auth로 대체됨. 이 라우트는 호환용 stub.
// Supabase OAuth callback은 /auth/callback/route.ts에서 처리.
export const GET = () => new Response("Not Found", { status: 404 });
export const POST = () => new Response("Not Found", { status: 404 });
