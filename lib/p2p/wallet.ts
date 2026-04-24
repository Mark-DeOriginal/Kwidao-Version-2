import { AVALANCHE_C_CHAIN_RPC, KNOWN_AVAX_TOKENS } from "./constants";

type RpcResponse<T> = {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
};

type WalletAssetBalance = {
  symbol: string;
  balance: string;
};

export type WalletSnapshot = {
  address: string;
  assets: WalletAssetBalance[];
};

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(AVALANCHE_C_CHAIN_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RpcResponse<T>;
  if (payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || "RPC returned no result");
  }

  return payload.result;
}

function formatUnits(raw: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  const padded = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toString()}.${padded}`;
}

function encodeBalanceOfCall(walletAddress: string): string {
  const methodId = "70a08231";
  const addressWithoutPrefix = walletAddress.toLowerCase().replace(/^0x/, "");
  return `0x${methodId}${addressWithoutPrefix.padStart(64, "0")}`;
}

async function getErc20Balance(contract: string, address: string, decimals: number) {
  const result = await rpcCall<string>("eth_call", [
    {
      to: contract,
      data: encodeBalanceOfCall(address),
    },
    "latest",
  ]);
  return formatUnits(BigInt(result), decimals);
}

export async function getWalletSnapshot(address: string): Promise<WalletSnapshot> {
  const normalizedAddress = address.toLowerCase();
  const nativeHex = await rpcCall<string>("eth_getBalance", [normalizedAddress, "latest"]);
  const assets: WalletAssetBalance[] = [
    {
      symbol: "AVAX",
      balance: formatUnits(BigInt(nativeHex), 18),
    },
  ];

  for (const token of KNOWN_AVAX_TOKENS) {
    const balance = await getErc20Balance(token.contract, normalizedAddress, token.decimals);
    assets.push({
      symbol: token.symbol,
      balance,
    });
  }

  return {
    address: normalizedAddress,
    assets,
  };
}
