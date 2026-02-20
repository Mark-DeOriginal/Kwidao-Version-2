// Blockchain to CoinGecko ID mapping
export const blockchainCoinMapping: Record<string, string> = {
  Avalanche: "avalanche-2",
  Ethereum: "ethereum",
  Solana: "solana",
  Sui: "sui",
  Polygon: "matic-network",
};

export async function fetchBlockchainLogos(blockchains: string[]) {
  try {
    const coinIds = blockchains
      .map((name) => blockchainCoinMapping[name])
      .filter(Boolean)
      .join(",");

    if (!coinIds) return {};

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?ids=${coinIds}&vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&locale=en`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const logos: Record<string, string> = {};

    data.forEach((coin: { id: string; image: string }) => {
      // Find the blockchain name that maps to this coin ID
      const blockchainName = Object.entries(blockchainCoinMapping).find(
        ([_, coinId]) => coinId === coin.id,
      )?.[0];

      if (blockchainName) {
        logos[blockchainName] = coin.image;
      }
    });

    return logos;
  } catch (error) {
    console.error("Failed to fetch blockchain logos:", error);
    return {};
  }
}
