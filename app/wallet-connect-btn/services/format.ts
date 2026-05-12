export function isValidEvmAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function shortenAddress(address: string, left = 6, right = 4) {
  if (!address) return "";
  if (address.length <= left + right + 3) return address;
  return `${address.slice(0, left)}...${address.slice(-right)}`;
}

export function formatUnits(raw: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const fraction = raw % divisor;

  if (fraction === BigInt(0)) return whole.toString();

  const padded = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toString()}.${padded}`;
}

export function formatDisplayAmount(value: string, digits = 6) {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return value;
  return asNumber.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function formatCurrencyUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

