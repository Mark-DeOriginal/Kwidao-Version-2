export const WALLETCONNECT_DEFAULT_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_WALLETCONNECT_DEFAULT_CHAIN || "43114",
);

export const WALLETCONNECT_EVM_RPC =
  process.env.WALLETCONNECT_EVM_RPC_URL?.trim() ||
  "https://api.avax.network/ext/bc/C/rpc";

export const WALLETCONNECT_ASSETS = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    contract: undefined,
    decimals: 18,
    coingeckoId: "avalanche-2",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    contract: "0xc7198437980c041c805a1edcba50c1ce5db95118",
    decimals: 6,
    coingeckoId: "tether",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    contract: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    decimals: 6,
    coingeckoId: "usd-coin",
  },
] as const;
