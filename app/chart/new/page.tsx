import { Suspense } from "react";
import { InputClient } from "./client";

export const metadata = { title: "명반 만들기" };

export default function NewChartPage() {
  return (
    <Suspense>
      <InputClient />
    </Suspense>
  );
}
