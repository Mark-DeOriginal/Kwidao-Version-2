import { NextRequest, NextResponse } from "next/server";
import { P2P_SESSION_COOKIE } from "@/lib/p2p/constants";
import {
  createOrLoginWalletUser,
  createSessionForUser,
  isValidWalletAddress,
} from "@/lib/p2p/auth";

type AuthBody = {
  walletAddress?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AuthBody;
    const walletAddress = body.walletAddress?.trim() || "";

    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const user = await createOrLoginWalletUser(walletAddress);
    const sessionToken = await createSessionForUser(user.id);

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          role: user.role,
          walletAddress: user.walletAddress,
        },
      },
      { status: 200 },
    );

    response.cookies.set(P2P_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("wallet auth failed", error);
    return NextResponse.json({ error: "Unable to authenticate wallet." }, { status: 500 });
  }
}

