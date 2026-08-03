# CLAUDE.md — Bailey

> **Name:** "Bailey" — after George Bailey of *It's a Wonderful Life* (1946), cinema's most beloved
> banker, whose Building & Loan always knew exactly where every dollar lived. Chosen 2026-07-20
> after four web-vetted naming rounds (see `plan/05-naming.md`; prior working title "Passbook" was
> dropped as risky). The film is US public domain and "Bailey" is a common surname — the reference
> is a wink, not an IP claim. Keep the wink implicit in commercial copy.

**Bailey is the neobank for AI-agent fleets on Arc — run by an AI agent.** Bailey is itself an
autonomous banker agent: its own SCA wallet + ERC-8004 identity, employed and paid in USDC by
the fleet, closing the books on schedule behind real decision gates (`plan/06-ai-neobank.md`).
One-liner: *"Your agents do the business. Bailey keeps the books."*
Market claim (exact wording): *"No one closes the books for agent fleets."*
Guardrails: Bailey NEVER moves fleet funds (it observes, reports, delivers, gets paid); deck/site
carry the line "Bailey is software, not a bank or custodian — funds never leave your fleet's
Circle wallets."

## Source of truth

The **`plan/` folder** is the source of truth — validated 2026-07-20 by an adversarial multi-agent
research workflow (verdict: GO, high confidence):

- `plan/README.md` — verdict + urgent actions index
- `plan/01-validation.md` — whitespace evidence, why-Arc verification, risk register
- `plan/02-mvp.md` — MVP scope, autonomy-first demo script, day-by-day schedule
- `plan/03-architecture.md` — indexer correctness rules, Circle SDK flows, addresses, self-contained build specs
- `plan/04-hackathon-compliance.md` — judging map, Circle-tool name-drop checklist, deadlines
- `plan/05-naming.md` — the naming decision and Bailey's clearance to-dos

## Hard constraints (each one is a verified fact or failure mode)

- **Hackathon deadlines (AoE, platform locks hard):** Checkpoint 2 (public repo + progress) Sun
  26 Jul 2026 · feature freeze ~6 Aug · final submission locks 2026-08-10 11:59 UTC · Demo Day
  20 Aug. Track: **Agentic Economy**. Bailey is the **sole entry**.
- **The demo must OPEN with agents autonomously transacting** (ERC-8183 job settlements), then the
  one-click month-end close — the track rejects "AI wrappers."
- **Arc testnet:** chain `5042002` · RPC `https://rpc.testnet.arc.network` (+ Blockdaemon/dRPC/
  QuickNode endpoints — spread load) · explorer `https://testnet.arcscan.app` · faucet
  `https://faucet.circle.com`. Mainnet is not launched; testnet is the correct target.
- **USDC one-asset-two-views:** native gas 18 dec = ERC-20 view at `0x36…0000` 6 dec, same balance.
  **Quantize all accounting to 6 decimals** (the ERC-20 view truncates below 1e-6).
- **EIP-7708 dedupe rule:** a single ERC-20 `transfer()` emits TWO Transfer logs — 6-dec from
  `0x3600…0000` and 18-dec from system emitter `0xffff…fffe`. Index USDC from ONE emitter only.
- **Gas fees emit no Transfer log** — derive the gas category from receipts
  (`gasUsed × effectiveGasPrice`).
- **Order events by `(blockNumber, logIndex)`, never timestamp; no reorg handling** (deterministic
  sub-second finality).
- **RPC quota:** wrap every call in retry (8s→60s backoff ×6 on quota-error regex); `eth_getLogs`
  ≤5k-block chunks; post-v0.7.2 limits: JSON-RPC batches ≤100, ≤32 subs/WSS connection, 30M gascap.
  Pinned fees 40/1 gwei + 900k gas limit are pre-v0.7.2 values — re-validate empirically.
- **Circle SDK (live-verified):** `@circle-fin/developer-controlled-wallets` pinned `^10.8.0`;
  `createWallets({blockchains:["ARC-TESTNET"], accountType:"SCA"})`; `createWallets` is NOT
  idempotent (guard with reuse flag); `walletId` XOR `walletAddress+blockchain`; Gas Station free
  testnet policy = 50 USDC/day (~8k tx/day) — pace demo agents.
- **Test EIP-7708/statement logic against the Arc RPC, never anvil** (anvil can't reproduce Arc
  semantics; transfers can revert even with sufficient balance — blocklist).
- **Out of MVP:** StableFX (live on testnet but DeFi-track → roadmap slide only), on-chain memos
  (EOA-vs-SCA unresolved — attach context off-chain), Nanopayments/x402 ingestion (stub or scope
  statement), opt-in privacy + USYC (not available/gated).
- **Contract addresses live in config, not code** (mainnet beta may land mid-hackathon). Key ones:
  EURC `0x89B5…D72a` · ERC-8004 Identity `0x8004…BD9e` · ERC-8183 escrow proxy `0x0747…4583` ·
  Multicall3From `0x522f…47D0`. ABIs: pull from Arcscan's verified contracts.
- **Naming/brand:** Circle's Brand Use Policy prohibits incorporating ARC (or any Circle mark) into
  product names — nominative use ("Bailey — built on Arc") is fine. Never lock new branding without
  the user's approval.

## AI bookkeeper policy

Model-agnostic via OpenRouter (`BOOKKEEPER_MODEL` env switch, never UI). Quality lives in the
harness: committed golden set of labeled transactions, blind prompt, temperature 0, structured
JSON + confidence, and a hard accuracy gate before any model may categorize production ledgers
(re-run on every model swap or prompt change). Demo the cross-vendor agreement table.

## Practical notes

- Secrets in gitignored `.env` (committed `.env.example` documents the layout); Circle Entity
  Secret recovery file lands in gitignored `.circle/`. Never commit keys.
- Session model policy: Fable 5 for research · Opus 4.8 for coding · Sonnet for writing.
- Do NOT read or reuse files from `C:\Users\Abcom\emii` (user directive) — everything needed is
  inlined in `plan/03-architecture.md`.
