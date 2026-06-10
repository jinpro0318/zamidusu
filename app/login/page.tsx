import { redirect } from "next/navigation";

// 외부 구명출처·북마크·관행적 /login 진입에 대비한 알리아스.
// 모든 쿼리스트링을 그대로 /sign-in 으로 전달.
export default async function LoginAlias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
    else if (Array.isArray(v) && v[0]) qs.set(k, v[0]);
  }
  const target = qs.toString() ? `/sign-in?${qs.toString()}` : "/sign-in";
  redirect(target);
}
