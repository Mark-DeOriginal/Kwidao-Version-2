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

Ethereum, Avalanche, OP Mainnet, Arbitrum, Base, Polygon PoS, Unichain, Linea,
Sonic, World Chain, Monad, Sei, XDC, HyperEVM, Ink, Plume, Injective, and Morph.

## Planned CCTP V2 chains

Codex, EDGE, Pharos, Arc, Solana, Starknet, and Stellar are tracked in
`CCTP_V2_CHAIN_EXPANSION_PLAN.md`.

Codex, EDGE, and Pharos need verified public chain IDs/RPC metadata before they
are enabled in the Wagmi route picker. Solana, Starknet, and Stellar need
non-EVM wallet and transaction adapters before users can bridge through them.
Arc is not enabled because Circle's EVM contract address page currently lists
Arc testnet but not an Arc mainnet EVM contract set.
