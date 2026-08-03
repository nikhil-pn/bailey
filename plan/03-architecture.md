# Bailey — Technical Architecture

All facts below are doc-verified or live-verified (see `01-validation.md`). Addresses/params
belong in config, not code — mainnet beta may land mid-hackathon.

## Components

```
┌─────────────┐   createWallets(SCA)   ┌──────────────────────┐
│  Onboarding  │ ─────────────────────▶ │ Circle dev-controlled │──┐ Gas Station
│  (business)  │   ERC-8004 register    │  SCA wallet fleet     │◀─┘ sponsors gas
└─────────────┘                         └──────────┬───────────┘
                                                   │ txs on Arc testnet
                       ┌───────────────────────────▼───────────────────────────┐
                       │ LEDGER INDEXER  (chunked getLogs + receipts, 4 RPCs)  │
                       │  • USDC: 0xfffe system emitter ONLY (dedupe rule)     │
                       │  • EURC ERC-20 Transfer logs                          │
                       │  • ERC-8183: JobFunded/PaymentReleased/Refunded/…     │
                       │  • gas: receipt.gasUsed × effectiveGasPrice           │
                       │  order: (blockNumber, logIndex) · quantize 6 dec      │
                       └───────────────────────────┬───────────────────────────┘
                                                   ▼
                    per-agent accounts + fleet roll-up (SQLite/Postgres)
                                                   │
                       ┌───────────────────────────▼───────────────────────────┐
                       │ AI BOOKKEEPER (OpenRouter, env-switchable model)      │
                       │  blind prompt · temp 0 · structured JSON + confidence │
                       │  golden-set accuracy gate before seating any model    │
                       └───────────────────────────┬───────────────────────────┘
                                                   ▼
                MONTH-END CLOSE: per-agent P&L · fleet statement · AI summary
                · CSV (QuickBooks layout) · refId reconciliation vs Circle API
                                                   ▼
                              Web UI (dashboard → account → close)
```

## Network + addresses (Arc testnet — config, not code)

| Item | Value |
|---|---|
| Chain / RPC | `5042002` · `https://rpc.testnet.arc.network` (+ Blockdaemon, dRPC, QuickNode endpoints + WSS — spread indexer load) |
| Explorer / faucet | `https://testnet.arcscan.app` (Blockscout) · `https://faucet.circle.com` |
| USDC | native gas (18 dec) = ERC-20 at `0x3600000000000000000000000000000000000000` (6 dec), same balance |
| EIP-7708 system emitter | `0xfffffffffffffffffffffffffffffffffffffffe` — Transfer log for every native USDC movement |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` (6 dec) |
| ERC-8004 IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` — parse `Registered` event (not just Transfer) |
| ERC-8183 escrow (proxy) | `0x0747EEf0706327138c69792bF28Cd525089e4583` (impl `0xA316…351A`, "AgenticCommerce") |
| Multicall3From | `0x522fAf9A91c41c443c66765030741e4AaCe147D0` (CallFrom precompile preserves msg.sender) |
| Memo (NOT in MVP) | `0x5294E9927c3306DcBaDb03fe70b92e01cCede505` — SCA support undocumented |
| viem chain | built-in `arcTestnet` from `viem/chains` — do not hand-roll |

## Indexer correctness rules (each is a verified failure mode)

1. **Dedupe:** a single ERC-20 `transfer()` emits TWO logs (6-dec `0x3600…` + 18-dec `0xfffe`).
   For USDC, index the `0xfffe` emitter only; document the rule prominently. For EURC (ordinary
   ERC-20), index its contract's Transfer logs.
2. **Gas lines from receipts**, not logs: `gasUsed × effectiveGasPrice` per fleet tx. Zero-value
   and self-transfers are also unlogged — don't promise them.
3. **Quantize to 6 decimals everywhere** — the ERC-20 view truncates below 1e-6; mixed-precision
   arithmetic produces phantom discrepancies on statements.
4. **Ordering:** `(blockNumber, logIndex)` only — timestamps are merely non-decreasing.
   **No reorg handling** (deterministic sub-second finality; act at 1 block).
5. **ERC-8183 nuances:** `JobCreated` carries NO budget → combine `BudgetSet`/`JobFunded`;
   `PaymentReleased` is **net of on-chain fees** (platformFeeBP/evaluatorFeeBP — 0 on testnet
   today, changeable); also index `Refunded`, `EvaluatorFeePaid`.
6. **Transfers can revert even with sufficient balance** (blocklist, zero-address, burn rules) —
   never assume send success from a balance check.
7. **Test against the Arc RPC, never anvil** — anvil cannot reproduce EIP-7708, native-value
   rules, or the blocklist.

## RPC layer (post-v0.7.2 — updated from the live-proven values)

- `withRpcRetry`: 6 attempts, 8s→16s→32s→60s backoff on quota-error regex (full spec in the
  shared-package section below).
- **Re-measure fees empirically on day 1** (the proven numbers predate v0.7.2). Starting point:
  pinned 40/1 gwei, fixed gas limit 900k, ~1.2s tx pacing.
- New v0.7.x limits to respect: JSON-RPC batches **≤100 entries**, **≤32 subscriptions**/WSS
  connection, 30M gascap on `eth_call`/`estimateGas`, EIP-155-only txs, pending txs hidden.
- `eth_getLogs` chunked at **≤5,000 blocks** (hard cap ~10k). Production roadmap slide: Circle
  Contracts event monitors + webhooks, or managed indexers (Envio/Goldsky/The Graph).

## Circle SDK flow (live-verified pattern)

```
initiateDeveloperControlledWalletsClient({apiKey, entitySecret})
  → createWalletSet → createWallets({blockchains:["ARC-TESTNET"], accountType:"SCA"})
  → createContractExecutionTransaction({walletId, …, fee:{type:'level',config:{feeLevel:'MEDIUM'}}})
  → poll getTransaction until COMPLETE
```
Gotchas (all verified the hard way): `walletId` XOR `walletAddress+blockchain` (mutually exclusive);
`createWallets` is **not idempotent** — guard with a reuse flag; wallets-SDK chain string is
`ARC-TESTNET` but App Kit uses `Arc_Testnet` — never mix; tsx CJS/ESM named-export quirk.
Pin SDK `^10.8.0`; freeze upgrades during hackathon week. Gas Station: free auto testnet policy,
50 USDC/day cap (resets 0:00 UTC) ≈ 8,000 tx/day — pace demo agents.

## AI bookkeeper harness (production-proven eval discipline)

- Golden set: ~15–20 labeled transactions (memo/context + counterparty + amount → expected
  category + confidence range), committed to the repo.
- Blind anchored rubric, temperature 0, structured JSON out, OpenRouter model via env
  (`BOOKKEEPER_MODEL`), never UI-selectable.
- **Hard gate:** a model may only categorize production ledgers after passing the golden set
  (accuracy threshold; re-run on every model swap or prompt change).
- Demo artifact: cross-vendor agreement table (two cheap models, same categories) — proves the
  harness, not the model, determines the books.

## Bailey shared package — self-contained build specs (no external repo needed)

Everything below is a known-good, live-proven pattern, specified fully so Bailey implements it
in its own `packages/shared`:

- **`retry.ts`** — `withRpcRetry(fn)`: 6 attempts, exponential backoff `min(60s, 8s·2^i)`,
  retrying only on `/request limit|rate limit|limit reached|limit exceeded|429|too many/i`
  (the public RPC returns quota errors as JSON-RPC errors that viem will NOT retry). Export
  pinned constants `ARC_FEES = { maxFeePerGas: 40 gwei, maxPriorityFeePerGas: 1 gwei }` and
  `ARC_GAS_LIMIT = 900_000n` (skips `estimateGas` round-trips) — re-validate both in the day-1
  spike since they predate v0.7.2. Default tx pacing ~1200 ms (`TX_PACE_MS` env).
- **`indexer.ts`** — `chunkedEvents()`: `eth_getLogs` windows of `5_000n` blocks walking forward
  from each contract's deployment block, every call wrapped in `withRpcRetry`, results merged and
  ordered by `(blockNumber, logIndex)`.
- **`scripts/register-entity.mjs`** — one-time Circle setup: generate a 32-byte Entity Secret
  locally (`randomBytes(32).toString('hex')`) → `registerEntitySecretCiphertext({ apiKey,
  entitySecret, recoveryFileDownloadPath: '.circle' })` → write `CIRCLE_ENTITY_SECRET` into the
  gitignored `.env`; `.circle/` (recovery file) is gitignored too.
- **`scripts/fleet-setup.mjs`** — wallet-set creation + N SCA wallets + faucet funding, guarded
  by a reuse flag (`createWallets` is NOT idempotent — re-running mints new wallets).
- **ABIs** — pull from the verified contracts on Arcscan (the ERC-8183 proxy/impl and ERC-8004
  registries are all verified there); commit under `packages/shared/abis/`.
- **Eval harness** — committed golden-set file + runner (`npm run bookkeeper:eval -- <model>`)
  implementing the gate from the section above.
- **`.env` layout** (gitignored, with a committed `.env.example`): `CIRCLE_API_KEY`,
  `CIRCLE_ENTITY_SECRET`, `OPENROUTER_API_KEY`, `BOOKKEEPER_MODEL`, `RPC_URLS` (comma-separated,
  all four endpoints), `TX_PACE_MS`.

## Day-1 spike (before building anything else)

1. SCA wallet native USDC send → fetch receipt + logs → confirm `0xfffe` Transfer emission and
   the dual-log pattern → write the dedupe rule as a tested function.
2. Same receipt → gas-line derivation (`gasUsed × effectiveGasPrice`).
3. Re-measure min base fee / confirm 40/1 gwei pinning still lands txs post-v0.7.2.
4. Optional upside: attempt Memo call from SCA (EntryPoint → SCA → Memo) to settle the
   contradiction; if it works, on-chain line-item memos become a differentiator.
