# WalletConnect Feature Pack

This folder is a portable `/walletconnect` feature you can move to another Next.js App Router project with minimal edits.

## What It Includes

- Isolated UI and styles:
  - `WalletConnectHeader`
  - `WalletConnectButton`
  - `WalletDashboard`
  - `WalletConnectProvider`
- Isolated data logic:
  - EVM RPC balance reads
  - CoinGecko price fetch
  - Wallet valuation assembly
- Local API namespace:
  - `GET /api/walletconnect/details`
  - `GET /api/walletconnect/prices`

## Required Environment Variables

Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in the .env to enable WalletConnect QR flows.
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_cloud_project_id
```

Optional:

```env
NEXT_PUBLIC_WALLETCONNECT_DEFAULT_CHAIN=43114
WALLETCONNECT_EVM_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_WALLETCONNECT_EVM_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Copy Checklist (Another Project)

1. Copy this folder: `app/walletconnect-feature`.
2. Copy route files:
   - `app/walletconnect/layout.tsx`
   - `app/walletconnect/page.tsx`
3. Copy API routes:
   - `app/api/walletconnect/details/route.ts`
   - `app/api/walletconnect/prices/route.ts`
4. Install dependencies:
   - `@rainbow-me/rainbowkit`
   - `wagmi`
   - `viem`
   - `@tanstack/react-query`
5. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
6. Ensure your app can load route-level CSS imports in `app/walletconnect/layout.tsx`.

## Endpoints + Example Usage

### Get wallet details

`GET /api/walletconnect/details?address=0x...&chainId=43114`

Returns:

- `wallet.address`
- `wallet.chainId`
- `assets[]` with `symbol`, `balance`, `priceUsd`, `valueUsd`
- `valuation.totalUsd`

### Get prices

`GET /api/walletconnect/prices`

Returns cached prices for AVAX, USDT, and USDC.

## Wallet Sign-In Plan (Connect Wallet = Login)

Use SIWE (Sign-In With Ethereum, EIP-4361) so users can sign in securely by wallet connection.

### Why this is needed

Do not trust raw wallet address posts for login. Anyone can submit another user's address.
Require a signature challenge and verify it server-side.

### Implementation Steps

1. Add nonce route: `GET /api/auth/wallet/nonce?address=0x...`
   - Generate random nonce.
   - Store in `AuthNonce` table (wallet, nonce, expiresAt).
   - Set short expiration (5 to 10 minutes).
   - Return nonce.

2. Add verify route: `POST /api/auth/wallet/verify`
   - Body: `{ message, signature }`.
   - Verify SIWE message signature server-side.
   - Validate:
     - nonce exists and is not expired,
     - nonce matches message nonce,
     - expected domain/uri/chainId are correct,
     - recovered signer matches message address.
   - Delete or rotate nonce after successful use.
   - Upsert user and create session cookie.

3. Add session route: `GET /api/auth/me`
   - Return current authenticated user from session cookie.
   - Use this to protect product pages/features.

4. Keep logout route
   - `POST /api/p2p/auth/logout` can be reused or duplicated to `/api/auth/logout`.

### Frontend Login Flow

1. User clicks connect and selects wallet.
2. Get `address` and `chainId` from wallet.
3. Request nonce from `/api/auth/wallet/nonce`.
4. Build SIWE message with nonce, domain, uri, issuedAt, chainId.
5. Ask wallet to sign message.
6. Send `{ message, signature }` to `/api/auth/wallet/verify`.
7. On success, session cookie is set and user is logged in.

### Suggested Libraries

- `siwe` for message creation and verification.
- `viem` or wallet provider RPC methods for signing on client.

### Security Checklist

- One-time nonce usage.
- Nonce expiry enforcement.
- Rate limit nonce and verify endpoints.
- Verify request origin/domain in production.
- Use `httpOnly`, `secure`, and `sameSite` cookies.
- Reject stale SIWE messages (`issuedAt` too old).

### Acceptance Criteria

- User can sign in by wallet without email/password.
- Replay attempts with old nonce fail.
- Invalid signatures fail.
- Protected routes return unauthorized when no valid session exists.
