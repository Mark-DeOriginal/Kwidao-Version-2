import { WALLETCONNECT_ASSETS } from "./constants";
import { getErc20Balance, getNativeBalance } from "./evmRpc";
import type { WalletAsset, WalletConnectionMeta, WalletDetailsResponse } from "../types/walletTypes";
import { getWalletPrices } from "./prices";

export async function getWalletDetails(
  connection: WalletConnectionMeta,
): Promise<WalletDetailsResponse> {
  const [nativeBalance, pricesResult] = await Promise.all([
    getNativeBalance(connection.address),
    getWalletPrices().catch(() => ({
      prices: [] as Array<{ symbol: string; usd: number; usd24hChange: number | null }>,
      updatedAt: new Date().toISOString(),
    })),
  ]);

  const priceMap = new Map<string, number>(
    pricesResult.prices.map((entry) => [entry.symbol, entry.usd] as const),
  );
  const erc20Assets = WALLETCONNECT_ASSETS.filter(
    (asset): asset is (typeof WALLETCONNECT_ASSETS)[number] & { contract: string } =>
      typeof asset.contract === "string",
  );

  const erc20Balances = await Promise.all(
    erc20Assets.map(async (asset) => {
      const balance = await getErc20Balance(
        asset.contract as string,
        connection.address,
        asset.decimals,
      );
      return { symbol: asset.symbol, balance };
    }),
  );

  const assets: WalletAsset[] = WALLETCONNECT_ASSETS.map((asset) => {
    const balance =
      asset.symbol === "AVAX"
        ? nativeBalance
        : erc20Balances.find((token) => token.symbol === asset.symbol)?.balance || "0";
    const priceUsd = priceMap.get(asset.symbol) ?? null;
    const numericBalance = Number(balance);
    const valueUsd =
      priceUsd !== null && Number.isFinite(numericBalance)
        ? numericBalance * priceUsd
        : null;

    return {
      symbol: asset.symbol,
      name: asset.name,
      contract: asset.contract,
      decimals: asset.decimals,
      balance,
      priceUsd,
      valueUsd,
    };
  });

  const valuation = assets.reduce(
    (acc, asset) => {
      if (asset.valueUsd === null) {
        acc.unpricedAssets += 1;
        return acc;
      }
      acc.totalUsd += asset.valueUsd;
      acc.pricedAssets += 1;
      return acc;
    },
    { totalUsd: 0, pricedAssets: 0, unpricedAssets: 0 },
  );

  return {
    wallet: connection,
    assets,
    valuation,
    updatedAt: new Date().toISOString(),
  };
}
