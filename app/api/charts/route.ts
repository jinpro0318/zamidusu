import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAstrolabe } from "@/lib/iztro/generate";
import { serializeAstrolabe } from "@/lib/iztro/serialize";
import { getEntitlements } from "@/lib/entitlements";
import { getOrCreateGuestUserId } from "@/lib/guest";
import { safeErrorBody } from "@/lib/errors";

const InputSchema = z.object({
  subjectName: z.string().max(40).optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  calendar: z.enum(["SOLAR", "LUNAR"]),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59).default(0),
  isLeapMonth: z.boolean().optional(),
});

const IZTRO_VERSION = "2.5.8";

const GENERIC_CHART_500 = "명반 생성에 실패했어요. 잠시 후 다시 시도해 주세요.";

// iztro / lunar-typescript 가 던지는 영문 에러를 사용자 친화적 한글 메시지로 변환.
// 대부분은 입력값 자체의 문제이므로 400으로 응답한다.
function translateIztroError(detail: string, input: { calendar: string; year: number; month: number; day: number; isLeapMonth?: boolean }): string {
  // 예: "only 29 days in lunar year 2012 month 12"
  const onlyDays = detail.match(/only (\d+) days in lunar year (\d+) month (\d+)/i);
  if (onlyDays) {
    const [, max, , m] = onlyDays;
    return `음력 ${m}월은 ${max}일까지만 있어요. 일을 다시 선택해 주세요.`;
  }
  // 예: "wrong solar year/month/day" 류
  if (/invalid|wrong|illegal/i.test(detail) && /date|day|month|year/i.test(detail)) {
    const cal = input.calendar === "LUNAR" ? "음력" : "양력";
    return `${cal} ${input.year}년 ${input.month}월 ${input.day}일이 올바르지 않아요. 날짜를 다시 확인해 주세요.`;
  }
  // 윤달 관련
  if (/leap/i.test(detail)) {
    return `선택한 해에는 윤달이 없거나 해당 윤달이 존재하지 않아요. '음력' 또는 다른 달로 변경해 보세요.`;
  }
  return "명반 계산에 실패했어요. 입력값을 확인 후 다시 시도해 주세요.";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[POST /api/charts] invalid JSON body", err);
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 },
    );
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const session = await auth();
    const userId = session?.user
      ? ((session.user as any).id as string)
      : await getOrCreateGuestUserId();

    const ent = await getEntitlements(userId);
    const count = await db.chart.count({ where: { userId } });
    if (ent.maxCharts !== -1 && count >= ent.maxCharts) {
      return NextResponse.json(
        { error: `무료 플랜은 ${ent.maxCharts}개까지 저장 가능합니다.` },
        { status: 402 },
      );
    }

    let payload;
    try {
      const astrolabe = generateAstrolabe(input);
      payload = serializeAstrolabe(astrolabe, IZTRO_VERSION);
    } catch (err) {
      console.error("[POST /api/charts] iztro 계산 실패", { input, err });
      const rawMessage = (err as { message?: string })?.message ?? String(err);
      // iztro 에러는 입력값 문제이므로 한글로 번역한 사용자 메시지만 응답.
      return NextResponse.json(
        { error: translateIztroError(rawMessage, input) },
        { status: 400 },
      );
    }

    const chart = await db.chart.create({
      data: {
        userId,
        subjectName: input.subjectName,
        gender: input.gender,
        birthCalendar: input.calendar,
        birthYear: input.year,
        birthMonth: input.month,
        birthDay: input.day,
        birthHour: input.hour,
        birthMinute: input.minute,
        isLeapMonth: input.isLeapMonth ?? false,
        payload: JSON.stringify(payload),
        iztroVersion: IZTRO_VERSION,
      },
    });

    return NextResponse.json({ id: chart.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/charts] 처리 실패", err);
    return NextResponse.json(safeErrorBody(err, GENERIC_CHART_500), { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const charts = await db.chart.findMany({
      where: { userId },
      select: {
        id: true,
        subjectName: true,
        gender: true,
        birthYear: true,
        birthMonth: true,
        birthDay: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ charts });
  } catch (err) {
    console.error("[GET /api/charts] 처리 실패", err);
    return NextResponse.json(safeErrorBody(err, GENERIC_CHART_500), { status: 500 });
  }
}
