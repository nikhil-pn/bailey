# Bailey — MVP Spec (validated scope, 2026-07-20; AI-native reframing adopted same day)

**Bailey is the neobank for AI-agent fleets on Arc — run by an AI agent.** Businesses employ
fleets of agents that earn and spend USDC continuously; fleets have wallets and explorers but no
*bank* — no per-agent accounts, no statements, no month-end books, no export an accountant can
use. Bailey gives every agent a real account — and Bailey is *itself* an autonomous agent: its
own SCA wallet and ERC-8004 identity, employed and paid in USDC by the fleet, closing the books
on its own schedule behind real decision gates (see `06-ai-neobank.md`). Bailey never moves
fleet funds — it observes, reports, delivers, and gets paid.

*"Your agents do the business. Bailey keeps the books."*
Market claim (exact wording — see validation §1): **"No one closes the books for agent fleets."**

Track: **Agentic Economy** · Target chain: **Arc testnet** (mainnet not launched; pitch as
"built on testnet today, mainnet-ready at launch").

---

## Scope (5 workstreams)

### 1. Fleet onboarding
Create N (≈5) Circle **dev-controlled SCA wallets** under one business via
`@circle-fin/developer-controlled-wallets` (pin `^10.8.0`): entity secret → wallet set →
`createWallets({blockchains:["ARC-TESTNET"], accountType:"SCA"})`. **Gas Station** sponsors all
gas (free testnet policy, 50 USDC/day). Register each agent an **ERC-8004 identity** (cheap,
judge-visible tie-in to Arc's official agentic stack). **Bailey itself is wallet N+1** with its
own ERC-8004 identity and a "banker" role in the schema/UI (`06-ai-neobank.md` item a). One-time
setup: generate a 32-byte Entity Secret locally, register via `registerEntitySecretCiphertext`
(recovery file in gitignored `.circle/`) — full flow in `03-architecture.md`.

### 2. Ledger indexer — the correctness core
Stream every USDC/EURC movement for the fleet's addresses into per-agent accounts + fleet
roll-up. Non-negotiable rules (each one is a verified failure mode, see `03-architecture.md`):
- Index native USDC from the **`0xfffe` system emitter only** — documented dedupe rule
  (every ERC-20 transfer emits two logs; double-counting is the product-killing bug).
- **Gas category from receipts** (`gasUsed × effectiveGasPrice`) — fees emit no Transfer log.
- **Quantize all accounting to 6 decimals** (ERC-20 view truncates below 1e-6).
- Order by `(blockNumber, logIndex)`, never timestamp; no reorg handling (deterministic finality).
- Chunked `eth_getLogs` ≤5k blocks, retry/backoff, JSON-RPC batches ≤100, load spread across the
  4 documented RPC endpoints.
- Income side: **ERC-8183 events** — `JobFunded`, `PaymentReleased` (net-of-fee), `Refunded`,
  `EvaluatorFeePaid` — the agents' "salary" lines.

### 3. AI bookkeeper
OpenRouter model (env-switchable, never UI) categorizes each tx: job income · API/service cost ·
gas · refund · internal transfer — structured JSON with confidence. Quality lives in the harness,
not the model: a committed **golden set of ~15–20 labeled transactions** with expected categories,
blind prompt, temperature 0, and a hard **accuracy gate before any model may categorize production
ledgers**. Demo the cross-vendor agreement table (two models, same verdicts) — it proves the
rubric, not the model, determines the books.

### 4. Month-end close — the demo moment
**Bailey runs the close itself**, behind real decision gates (pending-escrow hold · refId
reconciliation gate · confidence escalation) with a persisted, visible **decision journal**; the
"Close now" button calls the same function (demo-mode flag prevents a scheduled close firing
mid-recording). Output: per-agent P&L, fleet statement, AI-written plain-English summary, CSV
export (QuickBooks-compatible column layout), reconciled against Circle's List-Transactions API
via the `refId` param (added 2026-07-10). **The close is a paid job:** the treasury funds one
ERC-8183 "close" job → Bailey delivers the statement hash → `PaymentReleased` pays Bailey
(async — the close render never waits on-chain) → Bailey's fee appears as a categorized line in
the statement it just produced.

### 5. Demo fleet + frontend
A small transaction generator: agents fund/settle **ERC-8183 jobs** and pay each other for
"services" with visible decision logic (the track demands "clear decision logic tied to real
signals" — e.g. an agent accepts jobs above a price threshold, pays a data-provider agent per
call). Web UI: fleet dashboard → per-agent account view → close button → statement.
Both frontend and backend must be deployed (submission requires a "functional MVP with working
frontend and backend").

## Demo script (3-minute video — superseded by the fuller cut in `06-ai-neobank.md`)

1. **0:00–0:20 — agents transact autonomously** via ERC-8183; raw explorer hashes: "Your
   accountant cannot file this."
2. **0:20–0:45 — "So the fleet hires a banker — and the banker is an agent too."** Onboarding
   creates N fleet wallets + Bailey's own SCA wallet + ERC-8004 identity; Gas Station sponsors all.
3. **0:45–1:30 — Bailey works on real signals**: live 0xfffe ledger stream (measured stat: 21%
   of USDC-moving txs emit no ERC-20 log — invisible on Ethereum, gapless on Arc), real-time
   categorization with confidence, anomaly flag + journal entry (if gate e ships).
4. **1:30–2:20 — the close as a paid job**: gates hold → close fires → P&L, statement, AI
   summary, CSV, refId reconciliation → the "close" job pays Bailey → final shot: **Bailey's own
   account page showing that income line.** "The banker keeps its own books."
5. **2:20–3:00 — track + products verbatim** + path to production (machine-payable per-close
   billing inside per-agent-seat SaaS; Catena/Circle as complements; StableFX + Nanopayments
   billing as roadmap) + disclaimer: "Bailey is software, not a bank or custodian."

## Explicitly OUT of MVP (validated exclusions)

- **StableFX / EURC auto-sweep** → roadmap slide only. Live on testnet (cite as credibility) but
  DeFi-track product, untested from dev wallets, Permit2 + sandbox-API flow = demo-critical risk.
- **On-chain memos** → off-chain context store. EOA-vs-SCA support contradictory across sources.
- **Nanopayments/Gateway ingestion** → stub or scope-statement only (x402 flows bypass Transfer logs).
- **Per-transaction micro-billing** → roadmap slide ("per-categorization billing via Circle
  Nanopayments/x402") — would double demo tx volume and flood the statement with dust lines.
- **"Ask Bailey" NL chat** → cut; it is the AI-wrapper pattern the track penalizes, and a
  bookkeeper hallucinating a number on Demo Day is fatal.
- **Opt-in privacy, USYC yield** → not on testnet / gated; never on the critical path.
- **QuickBooks/Xero API integration** → CSV in their import format is enough for the demo.

## Schedule (backward from locked deadlines; ~20 days, zero slack)

| Dates | Milestone |
|---|---|
| **NOW → 20 Jul 11:59 UTC** | **USER: create project page (CP1 locks!), Agentic Economy track** |
| 20–22 Jul | **Day-1 spike:** EIP-7708 empirics — SCA native send → observe dual logs → codify dedupe + gas-from-receipts; re-measure fees post-v0.7.2. Repo scaffold + shared package (RPC retry/fees, verified ABIs, entity scripts — specs inlined in `03-architecture.md`) |
| 23–26 Jul | Fleet onboarding live (N SCA wallets + Gas Station + ERC-8004). **CP2 Sun 26 Jul: public repo + progress summary** |
| 27 Jul–2 Aug | Indexer complete (USDC/EURC + ERC-8183 income) → per-agent accounts + roll-up; bookkeeper + golden set + eval gate |
| 3–6 Aug | Month-end close: P&L, statement, AI summary, CSV, refId reconciliation; demo fleet generator; frontend; deploy. **Feature freeze Aug 6** |
| 7–9 Aug | 3-min video + deck; final competitive re-check (Catena/Circle/Entendre); **submit before 2026-08-10 11:59 UTC** |
| Thu 20 Aug | Demo Day |

## Business slide

Per-agent-seat SaaS + FX conversion bps (roadmap) + premium exports/integrations. Buyer: finance
teams of companies running agent fleets. Stack story: spend control (pre-tx policy) → trust (who
to transact with) → **Bailey: accounts + books (what happened to the money)** — with
Catena/Circle as the banking rails underneath, not competitors.
