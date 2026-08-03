<p align="center">
  <img src="assets/bailey-banner.png" alt="Bailey — the neobank for AI-agent fleets on Arc, run by an AI agent" width="100%" />
</p>

<p align="center">
  <a href="https://docs.google.com/presentation/d/15K5WSiv2lcQglOtXwpS97rYB3XQYaTVn/edit"><b>📊 Pitch deck</b></a> ·
  <a href="deck/Bailey-pitch.pdf"><b>📄 Deck (PDF, in-repo)</b></a> ·
  <a href="#-quickstart">⚡ Quickstart</a> ·
  <a href="#-for-judges--5-minute-path">⚖️ For judges</a> ·
  <a href="#-for-ai-agents--machine-brief">🤖 For AI agents</a> ·
  <a href="https://testnet.arcscan.app">🔗 ArcScan</a>
</p>

<p align="center">
  <b>Encode × Circle Programmable Money Hackathon — Agentic Economy track</b><br/>
  Arc testnet (chain <code>5042002</code>) · Native USDC + EURC · Circle Wallets · EIP-7708 · ERC-8004 · ERC-8183
</p>

---

## What Bailey is, in 30 seconds

Businesses now run **fleets of AI agents** that earn and spend USDC around the clock. Those fleets
have wallets and block explorers — but **no bank**: no per-agent accounts, no statements, no
month-end books, nothing an accountant can file.

**Bailey gives every agent a real bank account and closes the books.** And Bailey is *itself* an
autonomous agent — it has its own Circle wallet and on-chain ERC-8004 identity, is employed and
paid in USDC by the fleet, and earns its fee inside the very statement it produces.

> **Your agents do the business. Bailey keeps the books.**

Bailey **never moves fleet funds.** It observes, reports, delivers, and gets paid.
*Bailey is software, not a bank or custodian — funds never leave your fleet's Circle wallets.*

---

## 🎯 The Arc-only edge (measured, not claimed)

On Ethereum, native transfers emit **no logs** — a statement built from events silently misses them.
On Arc, **EIP-7708** makes every native USDC movement emit a `Transfer` log from the system emitter
`0xffff…fffe`.

A live read-only spike (`npm run spike:7708`, 2,000 blocks at head, full write-up in
[`docs/spike-eip7708.md`](docs/spike-eip7708.md)) measured:

| Metric | Value |
|---|---|
| Transfer logs from `0xffff…fffe` (system emitter, 18-dec) | **9,911** |
| Transfer logs from `0x3600…0000` (USDC ERC-20 view, 6-dec) | 6,946 |
| Txs moving USDC | 8,052 |
| — dual-log txs (both emitters) | 6,343 |
| — **native-only txs (no ERC-20 log — invisible to a normal indexer)** | **1,709 (21%)** |

**21% of USDC-moving transactions emit no ERC-20 log at all.** On Ethereum a log-based bank
statement would silently miss one in five transactions. On Arc, every one appears in the `0xfffe`
stream. **Gapless statements are derivable purely from chain data — only on Arc.**

> **Reproducible — and re-verified on a fresh window.** Re-running the same spike on
> 2026-08-03 over blocks 55,093,218–55,095,217 found **7,141** USDC-moving txs, of which **2,650
> (37%) were native-only**. The exact share moves with traffic mix; the structural fact does not.
> Run it yourself: `npm run spike:7708` — no keys required.

---

## 🏗 Architecture

```
Circle SCA fleet (5 agents + Bailey)          Arc testnet
        │  txs (gas: Circle Gas Station)          │
        ▼                                         ▼
  LEDGER INDEXER   src/indexer/
    · USDC from the 0xfffe emitter ONLY (dedupe rule R1 — never both emitters)
    · gas from receipts (gasUsed × effectiveGasPrice — fees emit no log)
    · ERC-8183 job events (JobFunded / PaymentReleased / Refunded / EvaluatorFeePaid)
        ▼
  ACCOUNTS + LEDGER   SQLite `bailey.db`, every amount quantized to 6 decimals
        ▼
  AI BOOKKEEPER   src/bookkeeper/
    · Circle List-Transactions `refId` joined to on-chain truth by txHash
    · deterministic rules first; LLM only for what's left; blind prompt, temp 0
    · golden-set accuracy GATE — a model that fails may not touch production ledgers
    · low confidence (< 0.6) stays uncategorized → escalation, never guessing
        ▼
  MONTH-END CLOSE   src/close/
    · per-account statement + CSV + P&L, refId reconciliation
    · the close itself is billed as an ERC-8183 job, paid to Bailey
        ▼
  WEB   src/server/api.ts (:8787) + web/ (React live view of the real ledger)
```

**The invariant that makes this trustworthy:** the AI fills in *Category* and *Confidence* and
writes the plain-English summary. **Every number is deterministic from chain data — never from a
model.**

---

## 🗺 Repo map

| Path | What's in it |
|---|---|
| [`plan/`](plan/) | **Source of truth.** Validation → MVP → architecture → hackathon compliance → naming → AI-neobank design → expansion. Start at [`plan/README.md`](plan/README.md). |
| `src/spike/` | The EIP-7708 spike — read-only, no keys, proves the thesis against the live chain |
| `src/indexer/` | `db.ts` (schema), `ingest.ts` (dedupe rules R1–R5, gas, ERC-8183), `run.ts` (CLI) |
| `src/bookkeeper/` | `categories.ts`, `llm.ts`, `golden.ts` (labeled set), `eval.ts` (the gate), `run.ts` |
| `src/close/` | `statement.ts` — statement + CSV renderer, the deterministic core of the close |
| `src/fleet/` | `onboard.ts` (Circle SCA wallets + ERC-8004 identities), `faucet.ts`, `demo-txs.ts`, `balances.ts` |
| `src/server/api.ts` | Zero-framework `node:http` API + static host for the built site |
| `src/config.ts` | Chain params + **all contract addresses** (config, not inline in code) |
| `src/money.ts` | The 18-dec ⇄ 6-dec quantization rules — the accounting-correctness core |
| `web/` | Vite + React: hero, animated "Cutaway" cross-section, and the **Live View** on the real ledger |
| `docs/` | [`spike-eip7708.md`](docs/spike-eip7708.md) (measured results), [`bookkeeper-eval.md`](docs/bookkeeper-eval.md) (model scores) |
| `deck/` | [Pitch deck](deck/Bailey-pitch.pdf) (PDF + PPTX), generated by `scripts/make-deck.mjs` |
| `abis/` | `ERC8183.json` |
| [`CLAUDE.md`](CLAUDE.md) | **The agent brief** — hard constraints, verified failure modes, project policy |

---

## ⚡ Quickstart

**Prerequisites:** Node **≥ 20** (uses `tsx`, native ESM, `better-sqlite3`) and npm. No database
server, no Docker, no contracts to deploy.

```bash
git clone https://github.com/nikhil-pn/bailey.git
cd bailey
npm install
```

### Path A — read-only, no keys ✅ *the recommended first run*

Everything here hits the **public Arc testnet RPC** read-only. **No wallet, no API key, no
signing, no money moves.** Each step takes ~1–3 minutes depending on RPC responsiveness.

```bash
npm run spike:7708   # 1. Validate EIP-7708 live: dual-log dedupe, native-only txs, gas-from-receipts
npm run index        # 2. Auto-discover busy addresses on-chain and index them into bailey.db
npm run statement    # 3. Render per-account statements + CSV into statements/
```

`npm run index` with no `--watch` **auto-discovers** the two busiest USDC movers and a recent
ERC-8183 job provider at chain head — so the whole pipeline is smoke-testable before a fleet
exists. Output lands in `bailey.db` (gitignored) and `statements/*.csv` (gitignored).

*Last verified end-to-end on 2026-08-03, Node 24, clean clone: spike ✅ · index ✅ (1,089 transfers
+ 1 ERC-8183 job event) · statement ✅ (3 accounts, 1,090 lines, CSVs written).*

### Path B — the full fleet, needs keys

Copy [`.env.example`](.env.example) → `.env` and fill it in (see [Environment](#-environment)).

```bash
npm run register-entity                            # one-time Circle Entity Secret setup → .circle/
npm run fleet:onboard -- --agents 5 --identities   # 5 agent SCA wallets + Bailey's banker wallet
                                                   #   + an ERC-8004 identity for each → fleet.json
npm run fleet:faucet                               # testnet USDC to the agents (NOT to Bailey —
                                                   #   Bailey's first income should be its close fee)
npm run fleet:demo-txs                             # agents pay each other, each tx tagged with a refId
npm run index -- --watch 0xabc...,0xdef...         # index the fleet's own addresses
npm run bookkeeper:eval                            # THE GATE — model must pass the golden set
npm run bookkeeper                                 # categorize the ledger (gated models only)
npm run statement                                  # the close: statements + CSV
```

> ⚠️ `fleet:onboard` is **not idempotent** — Circle's `createWallets` isn't. `fleet.json` is the
> reuse guard; delete it or pass `--force` to provision a fresh fleet.

### The web UI

```bash
npm --prefix web install
npm run api        # terminal 1 → API + built site on http://localhost:8787
npm run web:dev    # terminal 2 → Vite dev server (proxies /api to :8787)
```

For a single-process demo: `npm run web:build && npm run api` → the whole site is served from
**http://localhost:8787**.

The **Live View** reads your real `bailey.db`. If the API is offline it falls back to a baked
snapshot of genuine fleet data, so the page never shows invented numbers.

---

## 🖥 Command reference

| Command | Keys? | What it does |
|---|:---:|---|
| `npm run spike:7708` | — | Validates EIP-7708 rules against the live chain, read-only |
| `npm run index -- [--blocks 2000] [--watch 0xa,0xb] [--receipts 15] [--db bailey.db]` | — | Indexes USDC (`0xfffe` only), gas from receipts, ERC-8183 job events |
| `npm run statement -- [--db bailey.db] [--out statements]` | — | Per-account statement + CSV from the ledger |
| `npm run api` | — | API + static site on `:8787` (override with `PORT`) |
| `npm run web:dev` / `npm run web:build` | — | Vite dev server / production build |
| `npm run register-entity` | Circle | One-time Entity Secret registration; recovery file → `.circle/` |
| `npm run fleet:onboard -- [--agents 5] [--identities] [--force]` | Circle | Wallet set → N agent SCA wallets + Bailey's banker wallet → `fleet.json` |
| `npm run fleet:faucet` | Circle | Drips testnet USDC to agent wallets (rate-limit aware) |
| `npm run fleet:demo-txs` | Circle | Agents pay each other in USDC, each with a semantic `refId` |
| `npm run fleet:balances` | — * | Prints native USDC balance for every wallet in `fleet.json` |
| `npm run bookkeeper:eval [-- <model>]` | OpenRouter | **The gate.** Scores a model against the golden set |
| `npm run bookkeeper` | Circle + OpenRouter | Enriches with `refId`s, applies rules, categorizes the rest |

\* reads the chain read-only, but needs an existing `fleet.json`.

---

## 🔑 Environment

Copy `.env.example` → `.env`. **`.env` is gitignored — never commit keys.**

| Variable | Required for | Notes |
|---|---|---|
| `CIRCLE_API_KEY` | fleet, bookkeeper | [console.circle.com](https://console.circle.com) |
| `CIRCLE_ENTITY_SECRET` | fleet | Generated locally, registered via `npm run register-entity`; recovery file → `.circle/` (gitignored) |
| `OPENROUTER_API_KEY` | bookkeeper | Model-agnostic by design |
| `BOOKKEEPER_MODEL` | bookkeeper | Default `deepseek/deepseek-chat`. **Env switch only — never selectable in the UI** |
| `RPC_URLS` | all | Comma-separated Arc endpoints, primary first. Default `https://rpc.testnet.arc.network` |
| `TX_PACE_MS` | fleet | Tx pacing in ms (default `1200`) — public-RPC quota mitigation |

**Never committed:** `.env`, `.circle/`, `fleet.json` (wallet IDs), `bailey.db*`, `statements/`.

---

## 🔌 HTTP API

`npm run api` → port **8787** (`PORT` overrides). CORS is open; all responses JSON.

| Endpoint | Returns |
|---|---|
| `GET /api/summary` | `{ headBlock, accounts, entries, in6, out6, gas6, net6 }` — all amounts in 6-dec integer micro-USDC |
| `GET /api/accounts` | Per-account `{ address, label, role, balance6, inN, outN }` |
| `GET /api/entries?limit=50` | Ledger lines, newest first (`limit` capped at 200). Counterparties are resolved to fleet labels, `mint`, or `external` |
| `GET /*` | The built site from `web/dist` (SPA fallback), if present |

> All `*6` fields are **integers in micro-USDC** (6 decimals). Divide by 1e6 to display. This is
> deliberate — floats are not allowed anywhere in the books.

---

## ✅ Verified results

**EIP-7708 spike** — live, read-only, blocks 52,671,781–52,673,780 → **21% native-only txs**.
Dual-log proof and gas-from-receipts proof (to the micro-cent) in [`docs/spike-eip7708.md`](docs/spike-eip7708.md).

**AI bookkeeper golden-set gate** — every critical case correct **AND** ≥ 11/12 overall, re-run on
every model swap or prompt change ([`docs/bookkeeper-eval.md`](docs/bookkeeper-eval.md)):

| Model | Score | Verdict |
|---|:---:|:---:|
| `deepseek/deepseek-chat` | **12 / 12** | ✅ seated |
| `openai/gpt-4o-mini` | 11 / 12 | ✅ passes (missed the ambiguous-no-refId case) |

The gate is deliberately harsh on the *ambiguous* cases: a model that confidently guesses on a
transaction with no `refId` is worse than one that returns `unknown` at confidence 0.10.

**Live fleet** — 6 Circle SCA wallets on Arc testnet (5 agents + `bailey-banker`), 17 indexed
ledger entries, 17 categorized, fleet books balancing to **100.000000 USDC** to the micro-cent.

---

## ⚖️ For judges — 5-minute path

1. **The claim is measurable, and you can re-measure it yourself.** `npm install && npm run spike:7708`
   — no keys, no wallet, ~90 seconds against the public Arc RPC. It reports the dual-log pair, the
   native-only percentage, and a gas figure that appears in **no** Transfer log.
2. **See the books.** `npm run index && npm run statement` → real statements + CSVs from live chain
   data, still with no keys.
3. **See the bank.** `npm --prefix web install && npm run web:build && npm run api` → the Live View
   at `localhost:8787` renders the ledger you just built.
4. **Check the honesty boundary.** Open [`src/close/statement.ts`](src/close/statement.ts): every
   figure comes from indexed chain data. The model touches only `category`, `confidence`, and prose.
5. **Check the gate.** [`docs/bookkeeper-eval.md`](docs/bookkeeper-eval.md) — a committed golden set,
   two vendors scored, with the failure recorded rather than hidden.

**Why it isn't an "AI wrapper":** the demo opens with **agents autonomously transacting on-chain**
(ERC-8183 job settlements, Gas-Station-sponsored), and the AI is the *bookkeeper*, gated by an
accuracy harness — not a chat box over an API.

**Why it needs Arc specifically:** see the 21% above. On a chain without EIP-7708 this product is
not correctly buildable from logs at all.

---

## 🤖 For AI agents — machine brief

If you are an agent reading this repo, load these in order and respect these invariants.

**Read order:** `CLAUDE.md` (hard constraints + failure modes) → `plan/README.md` (verdict + index)
→ `plan/03-architecture.md` (indexer rules, Circle flows, addresses) → `src/config.ts` (every
address lives here) → `src/money.ts` (quantization) → the subsystem you're changing.

**Invariants — violating any of these produces silently wrong books:**

| # | Rule |
|---|---|
| R1 | Index USDC `Transfer` logs from **`0xffff…fffe` ONLY**. A single ERC-20 `transfer()` emits **two** logs (6-dec from `0x3600…0000`, 18-dec from the emitter). Reading both **double-counts every transfer**. |
| R2 | Native sends, contract value moves and ERC-20 transfers all appear in R1's stream — that is what makes statements gapless. |
| R3 | Gas emits **no** Transfer log. Derive it from receipts: `gasUsed × effectiveGasPrice`. |
| R4 | **Quantize every amount to 6 decimals.** Native gas is 18-dec; the ERC-20 view is 6-dec; they are *the same balance*. Track sub-micro dust separately. |
| R5 | Order events by `(blockNumber, logIndex)` — **never by timestamp**. No reorg handling (deterministic sub-second finality). |
| R6 | **Numbers are never model output.** The LLM may write only `category`, `confidence` and prose. |
| R7 | Confidence **< 0.6 stays uncategorized** — escalate, don't guess. |
| R8 | **Bailey never moves fleet funds.** No code path may transfer value out of an agent wallet on Bailey's own initiative. |

**Environment facts:** chain id `5042002` · RPC `https://rpc.testnet.arc.network` · explorer
`https://testnet.arcscan.app` · faucet `https://faucet.circle.com` · `eth_getLogs` ≤ **5,000-block**
chunks · JSON-RPC batches ≤ 100 · wrap **every** RPC call in `withRpcRetry` (`src/retry.ts`;
8s→60s backoff ×6 on quota errors).

**Known traps, each already paid for once:**
- `createWallets` is **not idempotent** — `fleet.json` is the reuse guard.
- Test EIP-7708 and statement logic **against the Arc RPC, never anvil** — anvil cannot reproduce
  Arc semantics, and transfers can revert on Arc even with sufficient balance (blocklist).
- The Circle SDK is CJS; its named exports defeat Node's ESM static detection under `tsx` — use
  `createRequire` (see `src/fleet/onboard.ts`).
- Circle Gas Station free testnet policy ≈ **50 USDC/day** — pace demo agents.
- `walletId` **XOR** `walletAddress + blockchain`, never both.
- Contract addresses belong in `src/config.ts`, never inline in code.

---

## 🔒 Guardrails

- **Bailey observes, reports, delivers, and gets paid. It never moves fleet funds.**
- Bailey is **software, not a bank or custodian** — funds never leave your fleet's Circle wallets.
- Secrets live in a gitignored `.env`; the Circle Entity Secret recovery file lands in gitignored
  `.circle/`. `fleet.json` (wallet IDs) is gitignored too.
- Everything in this repo targets **Arc testnet**. Mainnet is not launched.

---

## 🧰 Circle & Arc stack used

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

---

## 🩺 Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `better-sqlite3` fails to install | Node < 20, or no prebuilt binary for your platform — install build tools (`build-essential`, Python) and retry |
| RPC quota / rate-limit errors | Expected on the public endpoint. Retry is automatic (8s→60s ×6). Add more endpoints to `RPC_URLS`, comma-separated |
| `eth_getLogs` errors on a wide range | Keep chunks ≤ 5,000 blocks — lower `--blocks` |
| `npm run statement` renders nothing | Empty ledger — run `npm run index` first |
| `gas rows ingested: 0` | Usually correct, not a bug: Gas-Station-sponsored txs charge the paymaster, so the account owes no fee |
| Web page shows data but the API is down | Working as designed: the Live View falls back to a baked snapshot of real fleet data |
| `fleet:onboard` created duplicate wallets | `createWallets` isn't idempotent — `fleet.json` is the guard; don't delete it unless you mean to |
| `fleet:balances` / `fleet:demo-txs` crash on missing file | They need `fleet.json` — run `fleet:onboard` first |
| Bookkeeper refuses to categorize | By design: the model hasn't passed `npm run bookkeeper:eval` |

---

## 📌 Status

- [x] EIP-7708 spike validated live (dual-log dedupe, gas-from-receipts, 21% stat)
- [x] Ledger indexer — USDC via system emitter, ERC-8183 income events, quota-hardened RPC
- [x] Statement engine + CSV export (smoke-tested on 2,267 live transfers)
- [x] Fleet onboarding — Circle SCA wallets + ERC-8004 identities, live on Arc testnet
- [x] AI bookkeeper + golden-set eval gate (DeepSeek 12/12 · GPT-4o-mini 11/12)
- [x] Web UI — hero, animated cutaway, Live View on the real ledger
- [x] Pitch deck
- [ ] Close-as-a-paid-job end-to-end (ERC-8183 → Bailey) on the live fleet
- [ ] 3-minute demo video
- [ ] Public deployment

---

<sub>**Name:** after **George Bailey** of *It's a Wonderful Life* — the banker who knew where every
dollar lived. The film is US public domain and "Bailey" is a common surname; the reference is a
wink, not an IP claim.</sub>
