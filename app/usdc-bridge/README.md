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

Codex, EDGE, Pharos, Solana, Starknet, and Stellar are tracked in
`CCTP_V2_CHAIN_EXPANSION_PLAN.md`.

Codex, EDGE, and Pharos need verified public chain IDs/RPC metadata before they
are enabled in the Wagmi route picker. Solana, Starknet, and Stellar need
non-EVM wallet and transaction adapters before users can bridge through them.
Arc mainnet is enabled with CCTP domain 26. Its wallet network uses native USDC
with 18 decimals for gas, while CCTP interacts with Arc's 6-decimal ERC-20 USDC
interface at `0x3600000000000000000000000000000000000000`.

EVM-to-Arc transfers use Circle's CCTP Forwarding Service. The bridge requests
the live forwarding quote, includes the official `cctp-forward` hook in the
burn, and lets Circle submit the destination mint so first-time Arc recipients
do not need an existing Arc gas balance. Attestations and forwarded mints are
polled every five seconds for up to twenty minutes and remain recoverable from
persisted bridge history.
