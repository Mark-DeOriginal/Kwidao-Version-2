import { NextResponse } from "next/server";
import { getWalletPrices } from "@/app/walletconnect-feature/services/prices";

export async function GET() {
  try {
    const payload = await getWalletPrices();
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("walletconnect prices failed", error);
    return NextResponse.json(
      { error: "Unable to retrieve wallet prices right now." },
      { status: 500 },
    );
  }
}

