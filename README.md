# Bailey

**The neobank for AI-agent fleets on Arc — run by an AI agent.**
*Your agents do the business. Bailey keeps the books.*

Businesses employ fleets of AI agents that earn and spend USDC around the clock. Fleets have
wallets and explorers — but no bank: no per-agent accounts, no statements, no month-end books,
nothing an accountant can use. Bailey gives every agent a real account and closes the books —
and Bailey is *itself* an autonomous agent: its own wallet and on-chain identity, employed and
paid in USDC by the fleet, earning its fee in the very statement it produces.

Built for the **Encode × Circle Programmable Money Hackathon — Agentic Economy track**.

## The Arc-only edge (measured, not claimed)

On Ethereum, native transfers emit no logs — a statement built from events silently misses them.
On Arc, **EIP-7708** makes every native USDC movement emit a Transfer log from the system emitter
`0xffff…fffe`. Our live spike (`npm run spike:7708`, results in
[docs/spike-eip7708.md](docs/spike-eip7708.md)) measured **21% of USDC-moving transactions emit
no ERC-20 log at all** — invisible to a normal indexer, fully captured here. Gapless statements
are derivable purely from chain data, only on Arc.

## Circle & Arc stack used

| Product | Where |
|---|---|
| **Arc testnet** (chain 5042002) | everything — indexer, spike, fleet, contracts |
| **Native USDC** (18-dec gas = 6-dec ERC-20, one balance) | `src/money.ts` quantization rules; ledger |
| **Circle Wallets — developer-controlled SCA** (`@circle-fin/developer-controlled-wallets` v10.8) | `src/fleet/onboard.ts` — N agent wallets + Bailey's own banker wallet on `ARC-TESTNET`; `scripts/register-entity.mjs` — Entity Secret setup |
| **Circle Gas Station / Paymaster** | sponsors every fleet wallet's gas — agents never touch a gas token |
| **Circle List-Transactions `refId`** | wallets tagged `bailey:<name>` at creation; close reconciles the on-chain statement against Circle's API view |
| **EIP-7708 system emitter** | `src/indexer/ingest.ts` — the single-emitter dedupe rule (R1–R5) |
| **ERC-8004 agent identities** (Arc agentic stack) | `src/fleet/onboard.ts --identities` — every agent AND Bailey get on-chain identities |
| **ERC-8183 job escrow** (Arc agentic stack) | `src/indexer/ingest.ts` — income-side ledger (JobFunded / PaymentReleased net-of-fee / Refunded / EvaluatorFeePaid); the month-end close itself is billed as an ERC-8183 job paid to Bailey |
| **Circle CLI** (`@circle-fin/cli`, Agent Stack) | dev toolchain |
| **EURC** | multi-currency accounts (indexer-ready; StableFX conversion on roadmap) |
| Roadmap | **StableFX** (live on testnet — USDC↔EURC treasury policies), **Nanopayments/Gateway (x402)** per-categorization billing, Circle Contracts webhooks as production indexer |

Dev loop: built with Circle Skills (`circlefin/skills`) and the Circle MCP codegen server;
patterns follow `circlefin/agent-stack-starter-kits`.

## Architecture

```
Circle SCA fleet (agents + Bailey)      Arc testnet
        │  txs (gas: Gas Station)           │
        ▼                                   ▼
  LEDGER INDEXER — 0xfffe emitter only (dedupe rule) + ERC-8183 events + gas from receipts
        ▼
  per-agent accounts + fleet roll-up (SQLite, 6-dec book quantization)
        ▼
  AI BOOKKEEPER — OpenRouter, blind prompt, golden-set accuracy gate (categories only —
                  every number is deterministic from chain data)
        ▼
  MONTH-END CLOSE — decision gates + journal → P&L, statement, AI summary, CSV,
                    refId reconciliation → paid to Bailey via ERC-8183
```

Bailey never moves fleet funds — it observes, reports, delivers, and gets paid.
*Bailey is software, not a bank or custodian; funds never leave your fleet's Circle wallets.*

## Quickstart

```bash
npm install
npm run spike:7708        # validate EIP-7708 rules against the live chain (read-only)
npm run index             # index sample addresses read-only; or -- --watch 0x...,0x...
npm run statement         # render per-account statements + CSV from the ledger

# with Circle keys in .env (copy .env.example):
npm run register-entity   # one-time Entity Secret setup
npm run fleet:onboard -- --agents 5 --identities   # SCA fleet + Bailey + ERC-8004 identities
```

## Status

- [x] EIP-7708 spike validated live (dual-log dedupe, gas-from-receipts, 21% stat)
- [x] Ledger indexer (USDC via system emitter, ERC-8183 income events, quota-hardened RPC)
- [x] Statement engine + CSV export (smoke-tested on 2,267 live transfers)
- [x] Fleet onboarding code (Circle SDK, typechecked; needs `CIRCLE_API_KEY`)
- [ ] AI bookkeeper + golden-set eval gate
- [ ] Decision gates + journal; close-as-a-paid-job (ERC-8183 → Bailey)
- [ ] Web UI + deployment
- [ ] 3-minute video + deck

*(Name: after George Bailey of "It's a Wonderful Life" — the banker who knew where every dollar lived.)*
