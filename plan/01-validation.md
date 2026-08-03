# Bailey — Idea Validation (2026-07-20)

**Method:** 18-agent workflow — 4 independent web sweeps (hackathon rules, Arc tech state, Circle
kits, competitive landscape) + 1 sweep of a local corpus of prior verified Arc/Circle research,
followed by adversarial verification of every load-bearing claim (verifiers were prompted to
*refute*), then synthesis. Everything Bailey needs from that corpus is inlined into these plan
docs — no external repo is required to build.

**Verdict: GO_WITH_CHANGES · confidence: high.** All changes are folded into `02-mvp.md`.

---

## 1. Market whitespace — OPEN, re-verified, narrowing

The claim CLAUDE.md relied on ("Basis/Bitwave split, nobody builds books for agents") existed in
no local file until now. This section **is** the committed evidence.

**Verified as of 2026-07-20:** no crypto-native product ships per-agent statements, transaction
categorization, month-end close, P&L, or accountant-ready exports for AI-agent fleets. Checked
directly: Cambrian Q1-2026 agentic-finance landscape (zero accounting category among 40+
projects), July-2026 arXiv agent-finance survey (2607.00245), Catena Labs, Circle Agent
Stack/Agent Wallets docs, agents.circle.com, the Arc ecosystem page, Fireblocks/TRES coverage.
Circle itself verifiably ships **no books** — console/API expose raw transaction lists only;
CSV/camt.053 accounting exports exist only in Circle Mint (institutional accounts, a different
product; don't confuse with the unrelated "Banking Circle" bank).

The landscape moved fast in H1 2026 — every mover stops at accounts/payments/policy, none at books:

| Player | What they do (H1 2026) | Books for agent fleets? |
|---|---|---|
| **Catena Labs** — closest competitor | $30M Series A, OCC trust-charter filing: "banking and governance platform for AI agents" — identity, accounts, policy, halt | No — banks the agents, doesn't close their books |
| **Circle Agent Stack** (May 11, 2026) | Agent Wallets, Marketplace, CLI, Nanopayments, Skills — "exclusively transaction execution and payment mechanics" | No accounting layer anywhere |
| **Fireblocks + TRES** ($130M acq.) | Crypto accounting for *human* companies | One product decision away — watch |
| **MoonPay + Entendre** (2026-06-22 acq.) | Crypto-native agentic accounting for *human* firms | Means the tech exists — serves humans, not fleets |
| **Basis** ($100M B @ $1.15B, Feb 2026), Pilot "AI Accountant" | Accounting agents for human firms, off-chain | Nothing on-chain |
| Bitwave / Cryptio / Integral | Crypto tax+accounting SaaS for human companies | Not agentic |

**Sharpened pitch claim:** *"No one closes the books for agent fleets."* Do **not** say "no bank
for agents" (Catena falsifies it). Frame Catena and Circle as complements — the layered stack
slide: spend control (pre-tx policy) → trust (who to transact with) → **accounts + books
(Bailey)**, with Catena/Circle as the banking rails underneath.

**Re-verify in the final pre-submission week** (the niche moves monthly): catena.com,
developers.circle.com/release-notes/agent-stack-2026, MoonPay/Entendre news.

## 2. Why-Arc thesis — CONFIRMED, with three engineering caveats

**EIP-7708 holds and was empirically observed on the live testnet** by an adversarial verifier:
the system emitter `0xfffffffffffffffffffffffffffffffffffffffe` emits a standard ERC-20 Transfer
log for **every** native USDC movement (CALL sends, CREATE endowments, SELFDESTRUCT, precompile
mint/burn/transfer). Docs verbatim: "a single universal record of balance changes at 18-decimal
precision." A gapless statement from pure chain data is real and Arc-only — lead the pitch with
it, but scope it honestly with these verified caveats (all handled in `03-architecture.md`):

1. **Dual-log dedupe:** a single ERC-20 `transfer()` emits TWO logs — 6-dec from
   `0x3600…0000` and 18-dec from the `0xfffe` emitter. Index one emitter only, or every
   statement double-counts. This is the #1 correctness trap of the whole product.
2. **Gas fees emit no Transfer event** (docs verbatim; block rewards likewise) — yet "gas" is a
   Bailey category. Derive it from receipts: `gasUsed × effectiveGasPrice`.
3. **Nanopayments/x402 flows aggregate off-chain via Gateway** and never hit the Transfer-log
   path. Scope the claim to on-chain movements, or stub a Gateway-receipts source.

## 3. Claims refuted or upgraded vs CLAUDE.md

| CLAUDE.md said | Validation found |
|---|---|
| StableFX: "verify before demo-critical; treat as roadmap if not live" | **LIVE on testnet** — hybrid API RFQ (`api-sandbox.circle.com/v1/exchange/stablefx/`) + on-chain PvP via FxEscrow (EIP-712 + Permit2), 12,596 txs. BUT: it's a **DeFi-track** core product, untested from dev-controlled wallets, and the FxEscrow address differs between blog and docs (fetch at build time). → Keep as roadmap slide, cite live status as credibility. |
| Inherited RPC numbers valid as-is | **REFUTED "no breaking changes":** testnet v0.7.x (v0.7.2 activated 2026-06-18) shipped client-visible changes — gascap 50M→30M, EIP-155-only txs over RPC, 100-entry JSON-RPC batch cap, max connections 500→250, 32 subscriptions/connection, pending txs hidden, lowercase addresses. The proven fee-pinning/pacing values predate this — re-measure in the day-1 spike. |
| Memo flow is "EOA-only" | **Contradictory across sources:** the prior local record said EOA-only; current Arc docs state no caller restriction. Undocumented either way. Memo contract: `0x5294E9927c3306DcBaDb03fe70b92e01cCede505`. → Keep memos out of the MVP critical path; off-chain context is the plan of record. |
| Public RPC quota is the big constraint | **Eased:** docs now list three additional load-balanced RPC/WSS endpoints — Blockdaemon, dRPC, QuickNode — alongside the primary. Spread indexer load across all four. |
| Judging = 4 generic criteria | Confirmed, but the track brief adds the sharper test: **"real agent autonomy, not just an AI wrapper."** A books-only demo fails this — demo must open with agents transacting. |

## 4. Hackathon facts (verified from the live Encode platform + its backing API)

Official name **"Programmable Money Hackathon"** — free, 4-week, online.
Launch Mon 13 Jul · **CP1 Sun 19 Jul AoE (locks 2026-07-20 11:59 UTC)** — create project/team/idea,
placeholders allowed · **CP2 Sun 26 Jul** — public repo + progress summary · registration closes
Sat 8 Aug · **final submission Sun 9 Aug AoE (locks 2026-08-10 11:59 UTC)**, platform locks hard ·
Demo Day Thu 20 Aug. Prize: up to 8 teams enter an 8-week accelerator.
Solo OK; **pre-existing code explicitly encouraged**; one project may enter both tracks;
multiple projects per team/person: no rule found — **moot, Bailey is the sole entry.**
Artifacts: functional MVP (frontend AND backend) deployed on
Arc, public repo, 3-minute video (must state track + core products used), deck.
(Note: the April 2026 lablab.ai "Agentic Economy on Arc" hackathon is a separate, past event.)

## 5. Tech readiness (per MVP-critical capability)

| Capability | Status | Note |
|---|---|---|
| Circle dev-controlled SCA wallets on ARC-TESTNET | **verified-live** | Live-proven on Arc testnet 19 Jul 2026 (ArcScan tx hashes) + SDK v10.8.0 types include `ARC-TESTNET`/`SCA`. Pin `^10.8.0`, freeze upgrades during hackathon. |
| Gas Station sponsorship on Arc | **verified-live** | Free auto-generated testnet policy, 50 USDC/day cap (resets 0:00 UTC) ≈ 8,000 tx/day at ~0.006 USDC/tx. Pace demo agents so a runaway loop can't exhaust it. |
| EIP-7708 statement derivation | **doc-verified + observed** | Pipeline itself unbuilt — day-1 spike required (§2 caveats). Test on Arc RPC, never anvil. |
| ERC-8183 income events | **verified-live** | AgenticCommerce proxy active (~6,888 USDC escrowed); a full job (158785) was settled through it 19 Jul. `JobCreated` carries no budget; `PaymentReleased` is net-of-fee. |
| ERC-8004 identities | **verified-live** | 27,288 holders; in Arc's official Agentic Economy docs. Nice tie-in, not MVP-critical. |
| StableFX | **doc-verified** | Live but DeFi-track + untested from dev wallets → roadmap slide. |
| OpenRouter bookkeeper + eval gate | **doc-verified** | The eval-harness pattern is fully documented and production-proven on Arc testnet; Bailey's tx-categorization golden set doesn't exist yet — must be built. |
| Indexer quota mitigations | **needs-check** | The retry/fee/pacing numbers were proven pre-v0.7.2 — respect new batch/subscription caps, re-measure fees empirically. |

## 6. Risk register

| Risk | Sev | Mitigation |
|---|---|---|
| CP1 locks in hours; final deadline has zero slack | high | Create project page now; feature-freeze ~Aug 6 for video + deck |
| Books-only demo reads as "AI wrapper dashboard" | high | Demo opens with agents autonomously earning/spending via ERC-8183, then the close |
| v0.7.x RPC changes invalidate inherited constants | med | Day-1 empirical re-measure; 4-endpoint spread; batch ≤100 |
| Judging names Agent Stack as the agentic core product | med | Name-drop checklist in 04-hackathon-compliance.md; position dev-controlled SCA as deliberate fleet-custody choice |
| "Gapless" overclaim (gas, dual logs, x402) | med | §2 caveats as engineering rules + honest pitch scoping |
| Whitespace shrinking (Catena, Fireblocks+TRES, Entendre) | med | Sharpened claim; complements framing; final-week re-check |
| Dust: ERC-20 view truncates below 1e-6 | med | Quantize ALL accounting to 6 decimals |
| Memo-from-SCA unresolved | low | Off-chain context; optional week-1 empirical test |

## 7. Key sources

- Hackathon: encodeclub.com/programmes/arc-hackathon (page + FAQ via platform API, 2026-07-20)
- Arc docs: docs.arc.io (EIP-7708 emitter semantics, Multicall3From `0x522fAf9A91c41c443c66765030741e4AaCe147D0`, StableFX, RPC endpoints, "Mainnet addresses are not yet available")
- Circle: circle.com/pressroom Agent Stack launch (2026-05-11); developers.circle.com (agent-stack, wallets, gas-station); github.com/circlefin/{skills, agent-stack-starter-kits, arc-nanopayments}; SDK v10.8.0 (2026-07-01)
- Competitive: Cambrian Q1-2026 landscape; arXiv 2607.00245; catena.com; Fireblocks/TRES and MoonPay/Entendre acquisition coverage
- Local corpus: prior verified Arc/Circle research (docs sweep, live wallet runs, eval results) — all facts Bailey needs are inlined in `03-architecture.md`
