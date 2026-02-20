import { NextResponse } from "next/server";

// Simple in-memory cache with TTL
const logoCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

async function fetchBlockchainLogosFromCoinGecko(blockchainIds: string[]) {
  try {
    const ids = blockchainIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?ids=${ids}&vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&locale=en`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch blockchain logos from CoinGecko:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blockchainsParam =
      searchParams.get("blockchains") ||
      "avalanche-2,ethereum,solana,sui,matic-network";
    const blockchainIds = blockchainsParam.split(",");

    const cacheKey = blockchainIds.sort().join(",");
    const now = Date.now();

    // Check cache
    const cached = logoCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    }

    // Fetch fresh data
    const data = await fetchBlockchainLogosFromCoinGecko(blockchainIds);

    const logos: Record<string, string> = {};

    // Map the blockchain coin IDs to their names
    const blockchainNameMap: Record<string, string> = {
      "avalanche-2": "Avalanche",
      ethereum: "Ethereum",
      solana: "Solana",
      sui: "Sui",
      "matic-network": "Polygon",
    };

    data.forEach((coin: { id: string; image: string }) => {
      const blockchainName = blockchainNameMap[coin.id];
      if (blockchainName) {
        logos[blockchainName] = coin.image;
      }
    });

    // Update cache
    logoCache.set(cacheKey, { data: logos, timestamp: now });

    return NextResponse.json({
      success: true,
      data: logos,
      cached: false,
      timestamp: now,
    });
  } catch (error) {
    console.error("Blockchain logos API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blockchain logos",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
