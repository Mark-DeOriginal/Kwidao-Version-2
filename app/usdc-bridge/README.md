# USDC Bridge Feature

This feature powers the `/usdc-bridge` route. It reuses the existing RainbowKit/Wagmi wallet connection layer and renders a Circle CCTP V2 bridge for native USDC transfers.

## Route

- `app/usdc-bridge/page.tsx`
- `app/usdc-bridge/layout.tsx`

## Required environment

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_cloud_project_id
```

Optional:

```env
NEXT_PUBLIC_CIRCLE_IRIS_API_URL=https://iris-api.circle.com
```

## Supported chains

Ethereum, Avalanche, OP Mainnet, Arbitrum, and Base.
