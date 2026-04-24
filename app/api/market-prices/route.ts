import { NextResponse } from "next/server";

// Simple in-memory cache with TTL
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

async function fetchFromCoinGecko(coinIds: string[]) {
  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&sparkline=true`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 10 }, // ISR: revalidate every 10 seconds
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from CoinGecko:", error);
    throw error;
  }
}

async function fetchCoinImages(coinIds: string[]) {
  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?ids=${ids}&vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&locale=en`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 10 },
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko markets API error: ${response.status}`);
    }

    const data = await response.json();
    const images: Record<string, string> = {};

    data.forEach((coin: { id: string; image: string }) => {
      images[coin.id] = coin.image;
    });

    return images;
  } catch (error) {
    console.error("Failed to fetch coin images:", error);
    return {};
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coinsParam =
      searchParams.get("coins") || "bitcoin,ethereum,avalanche-2,solana,sui";
    const coinIds = coinsParam.split(",");

    const cacheKey = coinIds.sort().join(",");
    const now = Date.now();

    // Check cache
    const cached = priceCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    }

    // Fetch fresh data
    const [priceData, imageData] = await Promise.all([
      fetchFromCoinGecko(coinIds),
      fetchCoinImages(coinIds),
    ]);

    // Combine price and image data
    const combinedData = {
      ...priceData,
      images: imageData,
    };

    // Update cache
    priceCache.set(cacheKey, { data: combinedData, timestamp: now });

    return NextResponse.json({
      success: true,
      data: combinedData,
      cached: false,
      timestamp: now,
    });
  } catch (error) {
    console.error("Market prices API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market prices",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
