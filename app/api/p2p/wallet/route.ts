import { NextRequest, NextResponse } from "next/server";
import { isValidWalletAddress } from "@/lib/p2p/auth";
import { getWalletSnapshot } from "@/lib/p2p/wallet";

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("address")?.trim() || "";
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const snapshot = await getWalletSnapshot(walletAddress);
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    console.error("wallet snapshot failed", error);
    return NextResponse.json(
      {
        error:
          "Unable to fetch wallet balances right now. Confirm RPC URL availability and try again.",
      },
      { status: 500 },
    );
  }
}

