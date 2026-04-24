import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

interface SubscribeBody {
  name?: string;
  surname?: string;
  email?: string;
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  ok: boolean;
  id: number;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ErrorResponse | SuccessResponse>> {
  try {
    const body = (await request.json()) as SubscribeBody;
    const { name, surname, email } = body;

    if (!name || !surname || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const created = await prisma.subscriber.create({
      data: { name, surname, email },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    // Prisma unique constraint error code
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
