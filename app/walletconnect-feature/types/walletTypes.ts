export type WalletAsset = {
  symbol: string;
  name: string;
  contract?: string;
  decimals: number;
  balance: string;
  priceUsd: number | null;
  valueUsd: number | null;
};

export type WalletConnectionMeta = {
  address: string;
  chainId: number | null;
  chainName: string | null;
  connectorName: string | null;
};

export type WalletValuation = {
  totalUsd: number;
  pricedAssets: number;
  unpricedAssets: number;
};

export type WalletDetailsResponse = {
  wallet: WalletConnectionMeta;
  assets: WalletAsset[];
  valuation: WalletValuation;
  updatedAt: string;
};

export type WalletPriceItem = {
  symbol: string;
  usd: number;
  usd24hChange: number | null;
};

export type WalletPricesResponse = {
  prices: WalletPriceItem[];
  updatedAt: string;
};

