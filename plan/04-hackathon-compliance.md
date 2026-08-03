# Bailey — Hackathon Compliance (Programmable Money Hackathon / "Build on Arc")

Platform: <https://www.encodeclub.com/programmes/arc-hackathon> · free · online · 4 weeks.
Track: **Agentic Economy** ("autonomous AI agents that hold wallets and pay, settle and transact
in USDC without a human in the loop… real agent autonomy, not just an AI wrapper").
Prize: up to 8 teams → 8-week accelerator (weekly workshops, 1-1 calls, cohort).

## Deadlines (all Anywhere-on-Earth = UTC−12; platform locks hard at deadline)

| When | What | Status |
|---|---|---|
| **Sun 19 Jul (locks 2026-07-20 11:59 UTC)** | **Checkpoint 1:** create project, add team, share idea — placeholders explicitly allowed | ⚠️ **USER ACTION NOW** |
| Sun 26 Jul | Checkpoint 2: public repo link + progress summary | plan covers |
| Sat 8 Aug | Registration closes | — |
| **Sun 9 Aug (locks 2026-08-10 11:59 UTC)** | Final submission | feature-freeze Aug 6 |
| Thu 20 Aug | Demo Day | — |

## Required submission artifacts

- [ ] Functional MVP with **working frontend AND backend**, deployed on Arc (testnet is correct —
      "Mainnet addresses are not yet available")
- [ ] Public code repo
- [ ] **3-minute video** (pitch + demo) that **states the track and which core products were used**
- [ ] Deck

## Judging criteria → how Bailey scores

| Criterion | Status | How we meet it |
|---|---|---|
| 1. Working prototype on Arc, meaningful USDC/Circle-tool use | plan-covers | SCA fleet + Gas Station + EIP-7708 indexer + ERC-8183/8004, all on Arc testnet, all live-verified primitives |
| 2. Right core products (Agent Stack for agentic builds) | **at-risk → mitigated** | See name-drop checklist below; position dev-controlled SCA as the deliberate fleet-custody choice vs user-controlled Agent Wallets |
| 3. Real use case, credible path to production | plan-covers | Verified whitespace; buyer = finance teams of fleet operators; per-seat SaaS; Catena/Circle as complements; "testnet today, mainnet-ready at launch" |
| 4. Execution/quality/presentation ("a clear, working demo beats unnecessary complexity") | plan-covers | One-click month-end close as THE demo moment — **but demo must OPEN with agents autonomously transacting** (track's autonomy test) |

## "Clear Circle-tool usage" — name-drop checklist (video + deck, verbatim product names)

- [ ] **Arc** (Circle's L1) + **native USDC** and **EURC**
- [ ] **Circle Wallets** — developer-controlled **SCA** wallets (`@circle-fin/developer-controlled-wallets` v10.8+)
- [ ] **Circle Gas Station / Paymaster** — agents never touch a gas token
- [ ] **Circle Agent Stack** alignment: reference `github.com/circlefin/agent-stack-starter-kits`
      patterns; install **Circle Skills** (`/plugin marketplace add circlefin/skills` — `use-arc`,
      `use-agent-wallet`, …) and the **Circle MCP server** (`api.circle.com/v1/codegen/mcp`) in the
      dev loop — and say so in the video
- [ ] **Circle List-Transactions API `refId`** reconciliation (API vs on-chain statement)
- [ ] **ERC-8004** identity + **ERC-8183** job escrow — Arc's documented Agentic Economy stack
- [ ] **EIP-7708** — the Arc-only capability the whole product stands on
- [ ] Roadmap slide: **StableFX** (live on testnet — cite it), **Nanopayments/Gateway (x402)**
      ingestion, Circle Contracts webhooks as production indexer

## Rules (verified)

- Solo participation OK; no team-size limits.
- **Pre-existing code and existing startups explicitly encouraged.**
- One project may enter **both tracks** if it genuinely qualifies (StableFX would be the DeFi
  hook, but keep the Agentic entry focused).
- **Bailey is the sole entry** — the platform's silence on multiple-projects-per-team is moot.
- If CP1 is missed: FAQ ties participation to creating a project "before the Checkpoint 1
  deadline", but applications stay open to 8 Aug — confirm with Encode immediately if it slips
  (support: [Build on Circle Discord](https://discord.com/invite/buildoncircle)).

## Final-week checks (niche moves monthly)

- [ ] Re-verify whitespace: catena.com · developers.circle.com/release-notes/agent-stack-2026 ·
      MoonPay/Entendre news
- [ ] Re-fetch contract addresses from docs (FxEscrow already moved once; mainnet beta may land)
- [ ] Confirm video states track + core products; deck includes the three-layer stack slide
