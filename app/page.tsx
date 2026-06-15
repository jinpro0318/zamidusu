import { auth } from "@/lib/auth";
import { HomeClient } from "./home-client";

export default async function Home() {
  const session = await auth();
  const account = session?.user
    ? { nickname: session.user.name?.trim() || (session.user.email ?? "회원").split("@")[0] }
    : null;
  return <HomeClient account={account} />;
}
