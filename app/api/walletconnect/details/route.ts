import { NextRequest, NextResponse } from "next/server";
import { getWalletDetails } from "@/app/walletconnect-feature/services/walletDetailsService";
import { isValidEvmAddress } from "@/app/walletconnect-feature/services/format";

function parseChainId(input: string | null) {
  if (!input) return null;
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address")?.trim() || "";
    const chainId = parseChainId(request.nextUrl.searchParams.get("chainId"));

    if (!isValidEvmAddress(address)) {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const payload = await getWalletDetails({
      address: address.toLowerCase(),
      chainId,
      chainName: chainId === 43114 ? "Avalanche C-Chain" : null,
      connectorName: null,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("walletconnect details failed", error);
    return NextResponse.json(
      {
        error: "Unable to fetch wallet details right now. Check RPC and market data availability.",
      },
      { status: 500 },
    );
  }
}

