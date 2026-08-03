# Bailey — Plan

Validated **2026-07-20** by an 18-agent research workflow (5 web/local sweeps + adversarial
verification of every load-bearing claim + synthesis). Full details in the numbered docs.

## Verdict: GO (with changes) — high confidence

> Build Bailey for the **Agentic Economy** track of the Encode × Circle **Programmable Money
> Hackathon** ("Build on Arc"). The bookkeeping whitespace is re-verified open as of 2026-07-20,
> and every MVP-critical Circle/Arc primitive is doc- or live-verified. The scope changes forced
> by the evidence are folded into [02-mvp.md](02-mvp.md).

One-liner: *"Your agents do the business. Bailey keeps the books."*

**Name:** "Bailey" (chosen 2026-07-20 after four web-vetted naming rounds; working title was
"Passbook" — vetted risky). Decision record + clearance to-dos: [05-naming.md](05-naming.md).

## ⚠️ Urgent — user actions (cannot be done by tooling)

1. **Create the Bailey project page TODAY** at
   <https://www.encodeclub.com/programmes/arc-hackathon> — Checkpoint 1 locks
   **2026-07-20 11:59 UTC** (≈17:29 IST today; ~17h from validation time). Placeholder
   details are explicitly allowed; select the **Agentic Economy** track.
2. **Checkpoint 2 (Sun 26 Jul):** public repo link + progress summary must be on the platform.

**Bailey is the sole hackathon entry** (decided 2026-07-20) — all effort goes here.

## Documents

| Doc | Contents |
|---|---|
| [01-validation.md](01-validation.md) | Full validation: whitespace evidence (now committed to disk), why-Arc verification, claims refuted/upgraded vs CLAUDE.md, risk register |
| [02-mvp.md](02-mvp.md) | The MVP spec: revised scope, demo script (autonomy-first), week-by-week schedule backward-planned from the locked deadlines |
| [03-architecture.md](03-architecture.md) | Technical architecture: indexer correctness rules, Circle SDK flows, addresses, self-contained implementation notes |
| [04-hackathon-compliance.md](04-hackathon-compliance.md) | Judging-criteria mapping, Circle-tool name-drop checklist, submission artifacts, deadlines |
| [05-naming.md](05-naming.md) | Naming decision record: four vetted rounds, final leaderboard, Bailey clearance to-dos |
| [06-ai-neobank.md](06-ai-neobank.md) | AI-native reframing (adopted 2026-07-20): Bailey is itself an agent — scope, gates, demo script |
| [07-expansion.md](07-expansion.md) | Neobank expansion: Bailey Credit (books-underwritten lending), USYC treasury yield, x402 spend rails — build/roadmap split |

## The three headline validation results

1. **The EIP-7708 product thesis is real and empirically confirmed on the live testnet**: Arc's
   system emitter `0xffff…fffe` emits a Transfer log for *every* native USDC movement — a
   complete statement is derivable from chain data, and this is Arc-only. Three caveats are now
   engineering requirements (dedupe, gas-from-receipts, 6-decimal quantization) — see architecture doc.
2. **The whitespace holds but is narrowing**: no crypto-native product closes the books for agent
   fleets (verified against Catena, Circle Agent Stack, Fireblocks+TRES, MoonPay/Entendre,
   Cambrian Q1-26 landscape). Sharpened claim: *"no one closes the books for agent fleets"* —
   not "no bank for agents" (Catena makes that false).
3. **Every MVP-critical Circle primitive is verified**: SCA wallets on ARC-TESTNET (live-proven
   19 Jul + SDK v10.8.0 types), Gas Station on Arc (50 USDC/day free policy), ERC-8183 income
   events (live-settled job), and Circle's May-2026 **Agent Stack** gives the exact product names
   the judges want to hear.
