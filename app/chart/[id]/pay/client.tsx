"use client";

// app/chart/[id]/pay/client.tsx
// 토스페이먼츠 결제위젯(v2) 렌더 + 결제 요청.
//   - customerKey: ANONYMOUS (비회원 게스트 결제)
//   - 결제 완료 → successUrl(/api/purchase/confirm)에서 서버가 최종 승인.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Z, SANS, SERIF } from "@/theme/tokens";
import { buildOrderId, type PremiumItemKey } from "@/lib/toss";

type Widgets = Awaited<ReturnType<Awaited<ReturnType<typeof loadTossPayments>>["widgets"]>>;

export function PayClient({
  chartId,
  itemKey,
  clientKey,
  orderName,
  amount,
  customerName,
}: {
  chartId: string;
  itemKey: PremiumItemKey;
  clientKey: string;
  orderName: string;
  amount: number;
  customerName: string;
}) {
  const router = useRouter();
  const widgetsRef = useRef<Widgets | null>(null);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const toss = await loadTossPayments(clientKey);
        const widgets = toss.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: "KRW", value: amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#toss-payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#toss-agreement", variantKey: "AGREEMENT" }),
        ]);
        if (cancelled) return;
        widgetsRef.current = widgets;
        setReady(true);
      } catch (e) {
        console.error("[PayClient] 위젯 초기화 실패", e);
        if (!cancelled) setError("결제 화면을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientKey, amount]);

  const handlePay = async () => {
    const widgets = widgetsRef.current;
    if (!widgets || paying) return;
    setPaying(true);
    setError(null);
    try {
      const orderId = buildOrderId(chartId, itemKey);
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/api/purchase/confirm`,
        failUrl: `${window.location.origin}/chart/${chartId}?pay=fail`,
        customerName,
      });
    } catch (e) {
      console.error("[PayClient] 결제 요청 실패", e);
      setError("결제를 진행하지 못했어요. 다시 시도해 주세요.");
      setPaying(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: Z.cream,
        padding: "20px 16px 40px",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <button
        type="button"
        onClick={() => router.push(`/chart/${chartId}`)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: SANS,
          fontSize: 13,
          color: Z.ink2,
          padding: "4px 0",
          marginBottom: 8,
        }}
      >
        ← 돌아가기
      </button>

      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 20, fontWeight: 800, color: Z.ink }}>
          결제하기
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
            padding: "13px 15px",
            background: Z.white,
            border: `1px solid ${Z.line}`,
            borderRadius: 14,
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: Z.ink }}>
            {orderName}
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 800, color: Z.ink }}>
            {amount.toLocaleString()}원
          </span>
        </div>
      </header>

      <div id="toss-payment-method" />
      <div id="toss-agreement" />

      {error && (
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: "#c0392b", marginTop: 12 }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || paying}
        style={{
          width: "100%",
          marginTop: 18,
          padding: "15px 16px",
          borderRadius: 14,
          border: "none",
          cursor: ready && !paying ? "pointer" : "not-allowed",
          opacity: ready && !paying ? 1 : 0.55,
          background: Z.p900,
          color: Z.white,
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        {paying ? "결제창을 여는 중…" : `${amount.toLocaleString()}원 결제하기`}
      </button>

      <p style={{ fontFamily: SANS, fontSize: 11, color: Z.ink3, marginTop: 12, textAlign: "center" }}>
        토스페이먼츠 테스트 결제입니다.
      </p>
    </main>
  );
}
