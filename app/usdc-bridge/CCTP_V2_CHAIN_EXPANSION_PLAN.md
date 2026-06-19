# CCTP V2 Chain Expansion Plan

This document guides future work to add the remaining Circle CCTP V2 USDC-supported chains to the Kwidao USDC bridge.

## Goal

Add the additional CCTP V2 chains supported by Circle so users can bridge native USDC across all feasible supported routes.

The current bridge is EVM-first and uses Wagmi, RainbowKit, Viem, and Circle CCTP V2 contracts. Non-EVM chains require separate wallet, address, transaction, and attestation handling before they can be enabled safely.

## Current Bridge Chains

The bridge currently supports:

| Chain | CCTP Domain | Integration Type |
| --- | ---: | --- |
| Ethereum | 0 | EVM |
| Avalanche | 1 | EVM |
| OP Mainnet | 2 | EVM |
| Arbitrum | 3 | EVM |
| Base | 6 | EVM |
| Polygon PoS | 7 | EVM |
| Injective | 29 | EVM-compatible |

## Additional Chains To Add

These are the additional CCTP V2 USDC-supported chains from Circle's supported blockchains and domains list.

| Chain | CCTP Domain | Integration Type | 
| --- | ---: | --- | --- |
| Unichain | 10 | EVM 
| Linea | 11 | EVM 
| Codex | 12 | EVM 
| Sonic | 13 | EVM 
| World Chain | 14 | EVM 
| Monad | 15 | EVM 
| Sei | 16 | EVM-compatible 
| XDC | 18 | EVM-compatible 
| HyperEVM | 19 | EVM 
| Ink | 21 | EVM 
| Plume | 22 | EVM 
| Starknet | 25 | Non-EVM 
| Arc | 26 | EVM 
| Stellar | 27 | Non-EVM
| EDGE | 28 | EVM 
| Morph | 30 | EVM 
| Pharos | 31 | EVM 
| Solana | 5 | Non-EVM 

Do not add BNB Smart Chain to the USDC bridge. Circle lists BNB Smart Chain for CCTP, but USDC is not supported there for CCTP V2; it is USYC-only.

## Icon Plan

Use one consistent icon strategy before adding more chains:

1. Prefer existing icon support from RainbowKit/Wagmi if available in the wallet modal.
2. Add app-local chain icons only for bridge dropdowns and route cards.
3. Store custom icons under `public/chains/` using stable names such as `unichain.svg`, `linea.svg`, and `solana.svg`.
4. Add a metadata field such as `icon: "/chains/linea.svg"` to each bridge chain config.
5. Use a text fallback based on `shortName` when an icon is missing.

Clarifying questions before this step:

- Should icons be official brand SVGs, simplified local SVG marks, or fetched from a package such as `@web3icons/react`?
- Are we allowed to add a new icon dependency, or should all icons live in `public/chains/`?
- Should non-EVM chains appear disabled with icons now, or stay hidden until fully functional?

## Phase 1: Prepare Shared Chain Metadata

Create or refactor a single chain metadata source for bridge chains.

Tasks:

- Move chain display metadata into a structure that can represent both EVM and non-EVM chains.
- Include `name`, `shortName`, `domain`, `chainType`, `accent`, `icon`, `explorer`, and CCTP capability flags.
- Keep EVM contract addresses separate from non-EVM program or contract references.
- Update bridge dropdowns to render from this shared metadata.

Clarifying questions before this phase:

- Should the UI show all chains immediately, including disabled non-EVM chains?
- Should testnet metadata be included now, or should this plan stay mainnet-only?
- Should the bridge continue defaulting to Base -> Arbitrum?

## Phase 2: Add EVM And EVM-Compatible Chains

Add the EVM-compatible chains first because the current burn, approve, mint, fee, and attestation flow already matches them.

Tasks:

- Add chain definitions to the Wagmi config for chains not already exported by `wagmi/chains`.
- Add each chain to the RainbowKit chain list.
- Add each chain to the CCTP bridge config with Circle domain, USDC address, explorer, icon, and contract addresses.
- Confirm whether each chain uses Circle's standard CCTP V2 contract addresses or a chain-specific exception.
- Confirm that RPC URLs are reliable enough for production use.
- Add environment variables for custom RPCs when public RPCs are weak or rate-limited.
- Test approval, burn, attestation polling, and mint on at least one new EVM route before enabling all routes.

Clarifying questions before this phase:

- Which EVM chains should ship first: all at once, or a smaller first batch like Unichain, Linea, Sonic, World Chain, and Ink?
- Should we require project-owned RPC endpoints for every added chain?
- Should chains with lower liquidity or newer infrastructure be hidden behind a "beta" label?

## Phase 3: Add Non-EVM Architecture

Solana, Starknet, and Stellar need their own wallet and transaction flows.

Tasks:

- Define an adapter interface for bridge operations: connect wallet, validate address, burn USDC, fetch attestation, mint or receive USDC.
- Keep the existing EVM flow as the first adapter.
- Add a Solana adapter using Circle's Solana CCTP V2 program references and a Solana wallet provider.
- Add a Starknet adapter using Starknet wallet tooling and Circle's Starknet contract references.
- Add a Stellar adapter with Stellar address handling and Circle's Stellar-specific guidance.
- Add address format validation per chain type.
- Add UI states for routes that require a different connected wallet than the current EVM wallet.

Clarifying questions before this phase:

- Which non-EVM chain matters most to Kwidao users: Solana, Stellar, or Starknet?
- Should users connect multiple wallets at once, or switch wallet modes by selected source chain?
- Should the first non-EVM release support both directions, or only non-EVM -> EVM / EVM -> non-EVM first?

## Phase 4: Route And UX Rules

Avoid showing routes as available before the transaction path is truly supported.

Tasks:

- Add route capability checks based on `chainType`, `sourceSupported`, `destinationSupported`, and adapter availability.
- Show clear disabled states for planned chains.
- Add labels for Fast Transfer availability when Circle marks fast transfer as available or not applicable.
- Ensure the selected destination cannot equal the selected source.
- Keep error messages specific to wallet mismatch, unsupported route, insufficient USDC, approval failure, burn failure, attestation pending, and mint failure.

Clarifying questions before this phase:

- Should unsupported planned routes be visible but disabled, or hidden completely?
- Should Fast Transfer be the default when available?
- Should users be allowed to force Standard Transfer even when Fast Transfer is available?

## Phase 5: Validation And Release

Add chains gradually and verify each layer before exposing them broadly.

Tasks:

- Verify Circle domains, USDC addresses, TokenMessengerV2 addresses, and MessageTransmitterV2 addresses from Circle docs.
- Verify each explorer URL format.
- Verify wallet network switching for every EVM chain.
- Run lint and production build.
- Perform manual bridge smoke tests with small USDC amounts.
- Update `app/usdc-bridge/README.md` after implementation.

Clarifying questions before this phase:

- Which environment should be tested first: mainnet with tiny amounts, or testnets where available?
- Should we keep a manual QA checklist in this repo?
- Who signs off on enabling a newly added chain in production?

## Implementation Notes

- Circle CCTP domains are not the same as public chain IDs.
- BNB Smart Chain should remain excluded for this USDC bridge.
- Some EVM chains may not exist in the installed `wagmi/chains` package and may need custom `Chain` definitions.
- Non-EVM chains should not be squeezed into the existing EVM-only flow. Add adapters instead.
- Icons should be treated as UI metadata, not wallet support.
- Documentation must be updated whenever a chain is added or intentionally deferred.

## Sources To Recheck During Implementation

- Circle CCTP supported blockchains and domains: `https://developers.circle.com/cctp/concepts/supported-chains-and-domains`
- Circle CCTP contract addresses: `https://developers.circle.com/cctp/references/contract-addresses`
- Circle Solana CCTP docs: `https://developers.circle.com/cctp/blockchain-integrations/solana`
- Circle Starknet CCTP docs: `https://developers.circle.com/cctp/blockchain-integrations/starknet`
- Circle Stellar CCTP docs: `https://developers.circle.com/cctp/blockchain-integrations/stellar`
