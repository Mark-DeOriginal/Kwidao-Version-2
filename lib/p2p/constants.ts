export const P2P_SESSION_COOKIE = "kwidao_p2p_session";

export const AVALANCHE_C_CHAIN_RPC =
  process.env.AVALANCHE_C_CHAIN_RPC_URL?.trim() ||
  "https://api.avax.network/ext/bc/C/rpc";

export const KNOWN_AVAX_TOKENS = [
  {
    symbol: "USDT",
    contract: "0xc7198437980c041c805a1edcba50c1ce5db95118",
    decimals: 6,
  },
  {
    symbol: "USDC",
    contract: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    decimals: 6,
  },
] as const;

