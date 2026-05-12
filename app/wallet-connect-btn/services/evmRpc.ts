import { WALLETCONNECT_EVM_RPC } from "./constants";
import { formatUnits } from "./format";

type RpcResponse<T> = {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
};

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(WALLETCONNECT_EVM_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status}`);
  }

  const payload = (await response.json()) as RpcResponse<T>;
  if (payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || "RPC returned no result.");
  }

  return payload.result;
}

function encodeBalanceOfCall(walletAddress: string): string {
  const methodId = "70a08231";
  const addressWithoutPrefix = walletAddress.toLowerCase().replace(/^0x/, "");
  return `0x${methodId}${addressWithoutPrefix.padStart(64, "0")}`;
}

export async function getNativeBalance(address: string) {
  const normalizedAddress = address.toLowerCase();
  const rawHex = await rpcCall<string>("eth_getBalance", [normalizedAddress, "latest"]);
  return formatUnits(BigInt(rawHex), 18);
}

export async function getErc20Balance(
  tokenContract: string,
  address: string,
  decimals: number,
) {
  const result = await rpcCall<string>("eth_call", [
    {
      to: tokenContract,
      data: encodeBalanceOfCall(address),
    },
    "latest",
  ]);

  return formatUnits(BigInt(result), decimals);
}

