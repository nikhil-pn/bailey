# Bailey — Neobank Expansion: Credit · Yield · Spend Rails (2026-07-20)

User direction: expand Bailey into full neobank features — lending against the account books,
yield generation, and "cards" for AI agents. Fact-checked against the live ecosystem (2 web
research agents, sources below). Split: **build-now** (fits before the Aug 6 freeze) vs
**roadmap** (real product names, no vaporware). Positioning guardrails hold throughout: Bailey
underwrites and keeps books; the **treasury** moves money; spend *control* stays the partner
layer.

## 1. Bailey Credit — lending underwritten from the books ★ uniquely ours

**The insight only Bailey can act on:** a lender needs to trust the borrower's books. Agent
fleets have no books — except Bailey's, which are *gapless by construction* (EIP-7708) and
categorized behind an eval gate. **The books are the credit bureau.**

**Build now (~1–1.5 days):**
- **Bailey Credit Score** per agent, computed *deterministically* from the ledger: income
  stability (service-income recurrence), net margin, refund rate, counterparty diversity,
  history depth. The AI writes the credit *memo* (rationale), never the number.
- **Credit line offer** on each agent's account page ("agent-5 qualifies for a 15 USDC working-
  capital line — 0.6× trailing weekly net income").
- Optional demo beat (+0.5d, gated): treasury disburses one real advance on-chain to a qualifying
  agent; repayment tracked as a `credit:advance` / `credit:repayment` category pair.
- **Guardrail:** Bailey *underwrites* (score, limit, approval journal entry); the **treasury
  wallet** disburses. The bookkeeper never touches the money it accounts for.

**Roadmap (real names):** at Arc mainnet, credit capital routes to **Aave V4 on Arc** — the
deployment ARFC has been live since 2026-06-19 (Temp Check passed; initial markets USDC/EURC/
WETH/cirBTC; $2M/yr revenue floor to Aave DAO) — plus announced Arc lending partners **Morpho,
Maple, Fluid** (say "announced ecosystem partners," never "live"). Bailey's underwriting data
feeds the market; verified on-chain P&L becomes the collateral-lite credit signal.

## 2. Yield — REAL on testnet via USYC (not a mock)

**Fact-check verdict:** no third-party yield protocol is live on Arc testnet (Aave = governance
stage; Morpho Blue singleton is not deployed; ecosystem logos ≠ deployments). But **USYC —
Circle's tokenized money-market fund ($1.6B AUM) — is live and touchable on Arc testnet**:
- Token `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` (6 dec) · Teller (verified, active)
  `0x9fdF14c5B14173D74C08Af27AebFf39240dC105A` · Entitlements `0xcc205224862c7641930c87679e98999d23c26113`.
- Testnet access = **per-wallet allowlist via a Circle Support ticket, 24–48h turnaround**.

**Build now (~1–1.5 days + ticket lead time):**
1. **File the allowlist ticket THIS WEEK** for ONE dedicated `bailey-treasury` wallet (not every
   agent — pooling is the point). ← user action, needs the Circle account.
2. Sweep policy: idle agent balances above a float → treasury; treasury deposits USDC → USYC via
   the Teller. Statement gains `yield:deposit` / `yield:income` categories.
3. **The gating IS the pitch:** real USYC is non-US-institutions-only with a $100k minimum —
   *individual agents can never reach institutional yield; Bailey pools the fleet's idle
   balances into a treasury that can.* That's what a real bank does with deposits.
- Honesty note for the slide: state it's USYC testnet; do NOT invent APY numbers. If the ticket
  stalls, the demo shows the sweep + the allowlist-aware onboarding (an AI banker that handles
  Entitlements onboarding is itself a differentiated beat); deposit becomes roadmap.

## 3. "Cards" — spend credentials that settle into Bailey

**What "cards for AI agents" really is in mid-2026** (all verified):
- Fiat rails: **Visa Intelligent Commerce** (100+ partners, OpenAI deal June 2026) and
  **Mastercard Agent Pay** (GA for US cardholders since Nov 2025; "Agent Pay for Machines" June
  2026 with Coinbase/Stripe/Catena among 30+ partners). Issuer-integrated — not reachable by
  Aug 10, and *issuing* is Ramp/Stripe/Slash/lobster.cash territory. Bailey does not issue.
- Crypto rail: **x402** (now a Linux Foundation standard — Visa, Mastercard, Google, AWS,
  Stripe, **Circle** are members) with **Circle Nanopayments on Gateway** as the Circle-native
  implementation — **live on Arc TESTNET** (mainnet covers 11 other chains so far).
- The Arc kicker for the deck: **Visa is Arc's lead design partner, settles US network
  obligations in USDC, and plans to run an Arc validator** — the card network is settling onto
  the chain Bailey keeps books on.

**Bailey's honest position:** *the account the card settles into.* Every agent "swipe" — an x402
receipt or a network-token transaction — lands in the agent's Bailey account: categorized,
reconciled, closed at month-end.

**Build now (gated, ~1–2 days):** the x402 receipts demo — a Bailey agent pays a metered API
per-call via Nanopayments; Bailey ingests the off-chain x402 receipts and reconciles them
against the on-chain Gateway batch settlement — the agent-era version of "card statement vs
network settlement file," and it neutralizes the one known gap in the gapless-statement claim.
**Go/no-go spike first (1–2h):** confirm an x402 facilitator works on Arc testnet AND that SCA
wallets can sign x402 authorizations (EIP-3009 typed data is EOA-native; fallback = a
dev-controlled EOA spender wallet; ERC-1271 support unverified). If red → slide-only:
"x402-ready ledger."

## Schedule impact (freeze Aug 6)

Core still outranks everything: close engine + gates + paid-close → demo generator → web UI →
deploy. Expansion inserts: **Bailey Credit score** (cheap, high wow) and **USYC ticket filed
immediately** (lead time is the constraint, build is small); **x402 receipts** only if its spike
is green by ~Aug 3 (same go/no-go date as anomaly rule e). Cut order if behind: x402 demo →
credit advance disbursement → USYC deposit (keep the sweep + score in all scenarios; keep every
roadmap slide regardless).

## The expanded pitch line

*"Accounts and statements today; credit underwritten from the books; pooled treasury yield via
USYC; and when your agents swipe — x402 today, Visa/Mastercard agent credentials tomorrow — it
all settles into Bailey."*

Sources: Aave ARFC (governance.aave.com, 2026-06-19) · docs.arc.io contract-addresses (USYC/
Teller/Entitlements) · circle.com blog (Nanopayments testnet incl. Arc; Agent Stack) · Visa
pressroom (Intelligent Commerce, OpenAI, USDC settlement, Arc design partner) · Mastercard
pressroom (Agent Pay, AP4M, stablecoin settlement) · x402 Foundation (Linux Foundation, Apr
2026) · crossmint.com/learn/agent-card-payments-compared · ArcScan verified-contract checks.
