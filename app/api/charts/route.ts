import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateAstrolabe } from "@/lib/iztro/generate";
import { serializeAstrolabe } from "@/lib/iztro/serialize";
import { getEntitlements } from "@/lib/entitlements";
import { getOrCreateGuestUserId } from "@/lib/guest";

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

function errorBody(stage: string, err: unknown) {
  const e = err as { message?: string; code?: string; name?: string };
  return {
    error: "명반 생성 중 오류가 발생했습니다.",
    stage,
    detail: e?.message ?? String(err),
    code: e?.code,
    name: e?.name,
  };
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
      return NextResponse.json(errorBody("astrolabe", err), { status: 500 });
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
    return NextResponse.json(errorBody("server", err), { status: 500 });
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
    return NextResponse.json(errorBody("server", err), { status: 500 });
  }
}
