import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/p2p/auth";
import { P2P_SESSION_COOKIE } from "@/lib/p2p/constants";

export async function POST() {
  await destroyCurrentSession();

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(P2P_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

