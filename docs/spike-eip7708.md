# Day-1 Spike: EIP-7708 statement thesis — validated live (2026-07-20)

Read-only run of `npm run spike:7708` against the public Arc testnet RPC
(`https://rpc.testnet.arc.network`), blocks **52,671,781–52,673,780** (2,000 blocks at head).
No wallet or keys involved. Script: `src/spike/eip7708.ts`.

## Observations

| Metric | Value |
|---|---|
| Transfer logs from `0xffff…fffe` (system emitter, 18-dec) | **9,911** |
| Transfer logs from `0x3600…0000` (USDC ERC-20 view, 6-dec) | 6,946 |
| Txs moving USDC | 8,052 |
| — dual-log txs (both emitters) | 6,343 |
| — **native-only txs (NO ERC-20 log — invisible to a normal ERC-20 indexer)** | **1,709 (21%)** |

**Dual-log proof** — tx `0x39ab6ab9f3f85f2086c3fb446d9d13010a53b6f001aa862e0c1394ef48ebb4cc`:
the same movement appears as `9.508095 USDC` (ERC-20 log, logIndex 2) **and**
`9.508095000000000000 USDC` (system log, logIndex 1) — exact 1e12 ratio. An indexer that reads
both emitters double-counts every ERC-20 transfer.

**Gas proof** — same tx: fee = `gasUsed 104,264 × effectiveGasPrice 55.9 gwei` =
`0.0058283576 USDC(18)` → book entry `0.005828 USDC`. **No Transfer log carries this amount** —
fees are only derivable from receipts.

**Fee environment re-check (post-v0.7.2):** `baseFeePerGas = 20 gwei` at block 52,671,782 — the
inherited 20-gwei-min / 40-gwei-pinned assumption still holds. (Observed txs paying up to ~56 gwei
effective; our pinned 40/1 remains valid, re-verify once when sending.)

## The pitch stat

**21% of USDC-moving transactions in this sample emit no ERC-20 Transfer log at all.** On
Ethereum those movements would be invisible to an event-based indexer — a bank statement built
from logs would silently miss one in five transactions. On Arc, every one of them appears in the
`0xfffe` system-emitter stream. This is the "only fully buildable on Arc" claim, measured.

## Codified indexer rules (now validated live)

- **R1** — For USDC, index Transfer logs from `0xffff…fffe` ONLY (18-dec); never also `0x3600` logs.
- **R2** — Native sends, contract value moves, and ERC-20 transfers all appear in R1's stream — statements are gapless.
- **R3** — "Gas" lines come from receipts: `gasUsed × effectiveGasPrice` (fees emit no Transfer log).
- **R4** — Quantize every amount to 6 decimals for the books; track sub-micro dust separately.
- **R5** — Order by `(blockNumber, logIndex)`; no reorg handling. EURC: index its own contract's Transfer logs.

## Remaining spike item (needs Circle keys)

Send a native USDC transfer **from an SCA wallet** and confirm its `0xfffe` log + userop gas
accounting — closes the loop for fleet wallets specifically (expected to match; the 1,709
native-only txs above already include contract-account value moves).
