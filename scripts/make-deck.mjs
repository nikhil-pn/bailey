// Generates deck/Bailey-pitch.pptx — the hackathon pitch deck.
// Brand: Bailey logo colors — deep navy + coral on pale whites. All numbers are real
// (live testnet runs, eval results, verified research). Run: node scripts/make-deck.mjs
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const PptxGenJS = require('pptxgenjs')

const C = {
  bg: 'F7F8FB',      // pale cool white page
  card: 'FFFFFF',    // white card
  mint: 'ECEFF9',    // pale periwinkle card
  line: 'D7DBEC',    // hairline
  deep: '1E2867',    // deep navy (title bg / headline ink)
  pine: '27338B',    // logo navy (card titles)
  emerald: 'EF5B36', // coral accent (kickers, hero numbers) — from the logo coin
  ink: '1D2340',     // body ink
  mut: '5C6382',     // muted
  paper: 'EEF0FA',   // pale panel on dark
  neg: 'D74E2B',     // accounting negatives
}
const DK = { card: '28337F', border: '3D49A5', text: 'EEF0FA', soft: 'AAB3E3', faint: '8F9AD9', kick: 'FF8A66' }
const FONT = 'Segoe UI'
const MONO = 'Consolas'
const W = 13.33, H = 7.5, MX = 0.62
const LOGO = 'assets/bailey-logo.png' // 1433x1075 (4:3)

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE' // 13.33 × 7.5 in — all coordinates below assume this
pptx.author = 'Bailey'
pptx.title = 'Bailey — the neobank for AI-agent fleets, run by an AI agent'

let pageNo = 0
function cornerLogo(s, dark) {
  if (dark) s.addShape('roundRect', { x: W - 1.5, y: 0.32, w: 1.06, h: 0.86, rectRadius: 0.09, fill: { color: 'FFFFFF' } })
  s.addImage({ path: LOGO, x: W - 1.44, y: dark ? 0.41 : 0.35, w: 0.94, h: 0.7 })
}
function page(opts = {}) {
  pageNo++
  const s = pptx.addSlide()
  s.background = { color: opts.dark ? C.deep : C.bg }
  if (!opts.bare) {
    s.addShape('rect', { x: 0, y: 0, w: W, h: 0.09, fill: { color: opts.dark ? C.emerald : C.pine } })
    cornerLogo(s, !!opts.dark)
    s.addText(
      [{ text: 'BAILEY', options: { bold: true, color: opts.dark ? C.paper : C.pine } },
       { text: '   ·   the neobank for AI-agent fleets, run by an AI agent', options: { color: opts.dark ? DK.soft : C.mut } }],
      { x: MX, y: H - 0.42, w: 9.5, h: 0.3, fontSize: 9, fontFace: FONT },
    )
    s.addText(String(pageNo), { x: W - 1.0, y: H - 0.42, w: 0.5, h: 0.3, fontSize: 9, color: opts.dark ? DK.soft : C.mut, align: 'right', fontFace: FONT })
  }
  return s
}
function head(s, kicker, title, dark = false) {
  s.addText(kicker.toUpperCase(), { x: MX, y: 0.38, w: W - 2 * MX, h: 0.32, fontSize: 12.5, bold: true, charSpacing: 2, color: dark ? DK.kick : C.emerald, fontFace: FONT })
  s.addText(title, { x: MX, y: 0.68, w: W - 2.2, h: 0.85, fontSize: 30, bold: true, color: dark ? 'FFFFFF' : C.deep, fontFace: FONT })
}
function card(s, x, y, w, h, fill = C.card) {
  s.addShape('roundRect', { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: C.line, width: 1 } })
}

// ───────────────────────── 1 · TITLE ─────────────────────────
{
  const s = page({ dark: true, bare: true })
  s.background = { color: C.deep }
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: C.emerald } })
  s.addText('ENCODE × CIRCLE — PROGRAMMABLE MONEY HACKATHON · AGENTIC ECONOMY TRACK', {
    x: MX, y: 0.55, w: W - 2 * MX, h: 0.3, fontSize: 11, charSpacing: 2, bold: true, color: DK.kick, fontFace: FONT,
  })
  // logo tile + wordmark lockup
  s.addShape('roundRect', { x: MX, y: 1.5, w: 1.78, h: 1.78, rectRadius: 0.2, fill: { color: 'FFFFFF' }, shadow: { type: 'outer', color: '000000', opacity: 0.3, blur: 10, offset: 3, angle: 90 } })
  s.addImage({ path: LOGO, x: MX + 0.14, y: 1.83, w: 1.5, h: 1.12 })
  s.addText('Bailey', { x: MX + 2.0, y: 1.42, w: 6.3, h: 1.5, fontSize: 76, bold: true, color: 'FFFFFF', fontFace: FONT })
  s.addText('The neobank for AI-agent fleets on Arc — run by an AI agent.', {
    x: MX, y: 3.55, w: 7.9, h: 0.6, fontSize: 21, color: C.paper, fontFace: FONT,
  })
  s.addText([
    { text: 'Your agents do the business. ', options: { color: DK.soft } },
    { text: 'Bailey keeps the books.', options: { color: 'FFFFFF', bold: true } },
  ], { x: MX, y: 4.2, w: 7.9, h: 0.5, fontSize: 17, italic: true, fontFace: FONT })
  // mini statement card
  const cx = 8.95, cy = 1.7, cw = 3.75
  s.addShape('roundRect', { x: cx, y: cy, w: cw, h: 3.6, rectRadius: 0.1, fill: { color: 'FFFFFF' }, shadow: { type: 'outer', color: '000000', opacity: 0.28, blur: 10, offset: 3, angle: 90 } })
  s.addText('agent-4 · July statement', { x: cx + 0.2, y: cy + 0.16, w: cw - 0.4, h: 0.3, fontSize: 11, bold: true, color: C.deep, fontFace: FONT })
  s.addText('LIVE ARC TESTNET DATA', { x: cx + 0.2, y: cy + 0.44, w: cw - 0.4, h: 0.22, fontSize: 7.5, charSpacing: 1.5, color: C.emerald, bold: true, fontFace: FONT })
  const rows = [
    ['funding', '+20.000000'], ['income:service', '+1.100000'],
    ['refund:in', '+0.400000'], ['expense:service', '(3.000000)'],
  ]
  rows.forEach((r, i) => {
    const y = cy + 0.78 + i * 0.5
    s.addShape('rect', { x: cx + 0.2, y: y + 0.42, w: cw - 0.4, h: 0.008, fill: { color: C.line } })
    s.addText(r[0], { x: cx + 0.2, y, w: 2.0, h: 0.4, fontSize: 10.5, color: C.mut, fontFace: MONO })
    s.addText(r[1], { x: cx + 1.7, y, w: cw - 1.9, h: 0.4, fontSize: 10.5, bold: true, align: 'right', color: r[1].startsWith('(') ? C.neg : C.pine, fontFace: MONO })
  })
  s.addText('net  +18.500000 USDC', { x: cx + 0.2, y: cy + 2.95, w: cw - 0.4, h: 0.4, fontSize: 12, bold: true, align: 'right', color: C.deep, fontFace: MONO })
  s.addText('Built on Arc · Circle Wallets · Gas Station · USDC', { x: MX, y: 6.6, w: 9, h: 0.35, fontSize: 12, color: DK.faint, fontFace: FONT })
}

// ───────────────────────── 2 · PROBLEM ─────────────────────────
{
  const s = page()
  head(s, 'The problem', 'Agent fleets earn and spend USDC around the clock — with no bank')
  const items = [
    ['Fleets are companies now', 'Businesses employ fleets of AI agents that earn income, pay for APIs and services, and settle jobs in USDC — continuously, autonomously.'],
    ['Wallets ≠ a bank', 'Explorers show raw hashes. There are no per-agent accounts, no statements, no month-end books, no categorized P&L.'],
    ['Finance teams are blind', '"Which agent made money last month? What did we spend on compute? Where is the export for our accountant?" — today, no answer exists.'],
  ]
  items.forEach(([t, b], i) => {
    const x = MX + i * 4.12
    card(s, x, 2.0, 3.85, 3.6, i === 2 ? C.mint : C.card)
    s.addText(t, { x: x + 0.25, y: 2.3, w: 3.35, h: 0.7, fontSize: 16.5, bold: true, color: C.pine, fontFace: FONT })
    s.addText(b, { x: x + 0.25, y: 3.05, w: 3.35, h: 2.3, fontSize: 12.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15 })
  })
  s.addText('“Your accountant cannot file this.”', { x: MX, y: 6.0, w: W - 2 * MX, h: 0.55, fontSize: 19, italic: true, bold: true, color: C.deep, align: 'center', fontFace: FONT })
}

// ───────────────────────── 3 · WHITESPACE ─────────────────────────
{
  const s = page()
  head(s, 'The whitespace — verified July 2026', 'No one closes the books for agent fleets')
  const rows = [
    [{ text: 'Who', options: { bold: true, color: 'FFFFFF', fill: { color: C.pine } } },
     { text: 'What they do', options: { bold: true, color: 'FFFFFF', fill: { color: C.pine } } },
     { text: 'Books for agent fleets?', options: { bold: true, color: 'FFFFFF', fill: { color: C.pine } } }],
    ['Catena Labs ($30M, OCC filing)', 'Banking & governance for agents — humans control agent money', 'No'],
    ['Circle Agent Stack (May 2026)', 'Agent wallets, marketplace, nanopayments — “exclusively payment mechanics”', 'No'],
    ['Fireblocks + TRES · MoonPay + Entendre', 'Crypto accounting — for human companies', 'No'],
    ['Basis ($1.15B) · Pilot AI Bookkeeper', 'Accounting agents for human firms, off-chain', 'No'],
  ]
  s.addTable(rows.map((r, i) => r.map(c => typeof c === 'string'
    ? { text: c, options: { fontSize: 12.5, color: C.ink, fill: { color: i % 2 ? C.card : C.mint }, valign: 'middle' } }
    : c)), {
    x: MX, y: 2.05, w: W - 2 * MX, colW: [3.6, 6.2, 2.29], rowH: 0.62,
    border: { type: 'solid', color: C.line, pt: 0.75 }, fontFace: FONT, align: 'left',
  })
  s.addText([
    { text: 'Adversarially re-verified against the live landscape (Cambrian Q1-26 map, arXiv agent-finance survey, vendor docs). ', options: { color: C.mut } },
    { text: 'Everyone stops at wallets, payments, or policy. Nobody produces the books.', options: { bold: true, color: C.deep } },
  ], { x: MX, y: 5.75, w: W - 2 * MX, h: 0.8, fontSize: 13.5, fontFace: FONT })
}

// ───────────────────────── 4 · WHY ARC ─────────────────────────
{
  const s = page()
  head(s, 'Why Arc — measured, not claimed', 'On Arc, the chain itself is a complete bank record')
  s.addText('21%', { x: MX, y: 1.9, w: 4.3, h: 1.9, fontSize: 100, bold: true, color: C.emerald, fontFace: FONT })
  s.addText('of USDC-moving transactions emit NO ERC-20 log — invisible to every normal indexer. We measured it on live Arc testnet.', {
    x: MX + 0.05, y: 3.85, w: 4.1, h: 1.6, fontSize: 14.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15,
  })
  const pts = [
    ['EIP-7708 (Arc-only)', 'Every native USDC movement emits a Transfer log from the system emitter 0xffff…fffe — statements are gapless, derived purely from chain data.'],
    ['On Ethereum: impossible', 'Native transfers emit no logs. A statement built from events silently misses 1 in 5 movements.'],
    ['Proven in our repo', '2,000 live blocks: 9,911 system logs vs 6,946 ERC-20 logs; dual-log dedupe + gas-from-receipts rules codified and tested (docs/spike-eip7708.md).'],
  ]
  pts.forEach(([t, b], i) => {
    const y = 1.95 + i * 1.45
    card(s, 5.35, y, 7.35, 1.3, i === 0 ? C.mint : C.card)
    s.addText(t, { x: 5.6, y: y + 0.12, w: 6.9, h: 0.35, fontSize: 14, bold: true, color: C.pine, fontFace: FONT })
    s.addText(b, { x: 5.6, y: y + 0.46, w: 6.9, h: 0.8, fontSize: 11.5, color: C.ink, fontFace: FONT })
  })
  s.addText('This product is only fully buildable on Arc.', { x: MX, y: 6.35, w: W - 2 * MX, h: 0.45, fontSize: 15, bold: true, italic: true, color: C.deep, align: 'center', fontFace: FONT })
}

// ───────────────────────── 5 · PRODUCT ─────────────────────────
{
  const s = page()
  head(s, 'The product', 'A real bank account for every agent — and books that close themselves')
  const feats = [
    ['Per-agent accounts', 'Circle dev-controlled SCA wallets; Gas Station pays all gas — agents never touch a gas token.'],
    ['Gapless statements', 'The EIP-7708 indexer captures every movement; amounts quantized to bank-grade 6 decimals.'],
    ['AI bookkeeper (gated)', 'Categorizes every line with confidence — behind a golden-set accuracy gate; low confidence escalates, never guesses.'],
    ['Month-end close', 'Per-agent P&L, fleet statement, AI-written summary, CSV/QuickBooks export, reconciled against Circle’s API by refId.'],
  ]
  feats.forEach(([t, b], i) => {
    const x = MX + (i % 2) * 3.75, y = 2.0 + Math.floor(i / 2) * 2.15
    card(s, x, y, 3.55, 1.95)
    s.addText(t, { x: x + 0.22, y: y + 0.15, w: 3.1, h: 0.4, fontSize: 14.5, bold: true, color: C.pine, fontFace: FONT })
    s.addText(b, { x: x + 0.22, y: y + 0.55, w: 3.1, h: 1.3, fontSize: 11, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.1 })
  })
  card(s, 8.35, 2.0, 4.35, 4.15, C.mint)
  s.addText('EVERY NUMBER IS CHAIN-DERIVED', { x: 8.6, y: 2.25, w: 3.9, h: 0.3, fontSize: 10.5, bold: true, charSpacing: 1.5, color: C.emerald, fontFace: FONT })
  s.addText('The AI only ever fills the category column and writes the summary. The amounts, balances and totals come from Arc — deterministic, auditable, reproducible.', {
    x: 8.6, y: 2.6, w: 3.9, h: 1.5, fontSize: 12.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15,
  })
  s.addText('Two vendors, same verdicts:', { x: 8.6, y: 4.15, w: 3.9, h: 0.3, fontSize: 12, bold: true, color: C.deep, fontFace: FONT })
  s.addText('DeepSeek 12/12 · GPT-4o-mini 11/12 on the committed golden set — the harness determines the books, not the model.', {
    x: 8.6, y: 4.5, w: 3.9, h: 1.4, fontSize: 12, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15,
  })
}

// ───────────────────────── 6 · THE BANKER IS AN AGENT ─────────────────────────
{
  const s = page({ dark: true })
  head(s, 'The twist', 'The banker is an agent too', true)
  const items = [
    ['Its own wallet & identity', 'Bailey holds a Circle SCA wallet and an on-chain ERC-8004 identity — registered live on Arc testnet.'],
    ['Employed by the fleet', 'The month-end close is a paid job: the fleet funds an ERC-8183 escrow, Bailey delivers the statement, PaymentReleased pays Bailey.'],
    ['Real decision gates', 'Holds the close while escrows are pending · refuses sign-off if refId reconciliation fails · escalates low-confidence lines. Every decision lands in a visible journal.'],
    ['In its own books', 'Bailey’s fee appears — correctly categorized — in the very statement it just produced. Same pipeline, zero special-casing.'],
  ]
  items.forEach(([t, b], i) => {
    const x = MX + (i % 2) * 6.15, y = 2.0 + Math.floor(i / 2) * 1.95
    s.addShape('roundRect', { x, y, w: 5.9, h: 1.75, rectRadius: 0.08, fill: { color: DK.card }, line: { color: DK.border, width: 1 } })
    s.addText(t, { x: x + 0.25, y: y + 0.13, w: 5.4, h: 0.4, fontSize: 15, bold: true, color: 'FFFFFF', fontFace: FONT })
    s.addText(b, { x: x + 0.25, y: y + 0.55, w: 5.4, h: 1.1, fontSize: 11.5, color: DK.text, fontFace: FONT, lineSpacingMultiple: 1.12 })
  })
  s.addText('Bailey never moves fleet funds — it observes, reports, delivers, and gets paid. Bailey is software, not a bank or custodian.', {
    x: MX, y: 6.15, w: W - 2 * MX, h: 0.5, fontSize: 12.5, italic: true, color: DK.soft, align: 'center', fontFace: FONT,
  })
}

// ───────────────────────── 7 · LIVE TODAY ─────────────────────────
{
  const s = page()
  head(s, 'Not a mockup', 'All of this is running on Arc testnet today')
  const facts = [
    ['6', 'Circle SCA wallets live — 5 agents + Bailey — each with an on-chain ERC-8004 identity; every tx gas-sponsored by Gas Station'],
    ['17', 'real USDC movements indexed through the EIP-7708 rule and rendered into per-agent statements with running balances + CSV'],
    ['100.000000', 'fleet books balance to the micro-cent: five 20-USDC faucet fundings; every internal payment cancels exactly'],
    ['12/12', 'golden-set eval gate passed (DeepSeek; GPT-4o-mini 11/12) before the model was allowed to touch the ledger'],
    ['0', 'escalations once Circle refId context was joined — and 100% honest escalation without it: the bookkeeper never guesses'],
    ['21%', 'of USDC txs invisible to ERC-20 indexers — measured live, captured completely by Bailey’s system-emitter rule'],
  ]
  facts.forEach(([n, b], i) => {
    const x = MX + (i % 3) * 4.12, y = 2.0 + Math.floor(i / 3) * 2.2
    card(s, x, y, 3.85, 2.0, Math.floor(i / 3) === 0 ? C.card : C.mint)
    s.addText(n, { x: x + 0.22, y: y + 0.12, w: 3.4, h: 0.65, fontSize: 30, bold: true, color: C.emerald, fontFace: FONT })
    s.addText(b, { x: x + 0.22, y: y + 0.78, w: 3.4, h: 1.15, fontSize: 10.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.1 })
  })
}

// ───────────────────────── 8 · HOW IT WORKS ─────────────────────────
{
  const s = page()
  head(s, 'How it works', 'From chain noise to closed books')
  const steps = [
    ['FLEET', 'Circle SCA wallets\n+ Bailey (banker)\nGas Station pays gas'],
    ['INDEXER', '0xfffe emitter only\nERC-8183 income events\ngas from receipts'],
    ['LEDGER', 'per-agent accounts\nfleet roll-up\n6-decimal book truth'],
    ['BOOKKEEPER', 'refId context join\ngolden-set-gated LLM\nescalates, never guesses'],
    ['CLOSE', 'decision gates + journal\nP&L · statement · CSV\npaid via ERC-8183'],
  ]
  steps.forEach(([t, b], i) => {
    const x = MX + i * 2.47
    card(s, x, 2.35, 2.22, 2.5, i === 4 ? C.mint : C.card)
    s.addText(t, { x: x + 0.12, y: 2.55, w: 1.98, h: 0.35, fontSize: 13.5, bold: true, color: C.pine, align: 'center', fontFace: FONT })
    s.addText(b, { x: x + 0.12, y: 2.95, w: 1.98, h: 1.7, fontSize: 10, color: C.ink, align: 'center', fontFace: FONT, lineSpacingMultiple: 1.25 })
    if (i < 4) s.addText('→', { x: x + 2.18, y: 3.35, w: 0.4, h: 0.5, fontSize: 22, bold: true, color: C.emerald, fontFace: FONT })
  })
  const rules = 'Correctness rules, validated live:  index ONE emitter (every ERC-20 transfer emits two logs) · fees emit no Transfer log — derive gas from receipts · quantize to 6 decimals · order by (block, logIndex), zero reorgs · escrow amounts are net-of-fee'
  card(s, MX, 5.3, W - 2 * MX, 1.15, C.mint)
  s.addText(rules, { x: MX + 0.3, y: 5.45, w: W - 2 * MX - 0.6, h: 0.9, fontSize: 11.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.2 })
}

// ───────────────────────── 9 · CIRCLE STACK ─────────────────────────
{
  const s = page()
  head(s, 'Built on Circle', 'Deep use of the right core products')
  const used = [
    ['Arc testnet', 'the L1 everything runs on'],
    ['Native USDC + EURC', 'one asset, two views — handled correctly'],
    ['Circle Wallets — dev-controlled SCA', 'the deliberate custody model for a business-owned fleet'],
    ['Gas Station / Paymaster', 'agents never touch a gas token'],
    ['List-Transactions refId', 'off-chain context reconciled to on-chain truth'],
    ['ERC-8004 + ERC-8183', 'Arc’s agentic stack: identities + job escrow (income rail + Bailey’s pay)'],
    ['Circle CLI · Skills · MCP', 'Agent Stack tooling in the dev loop'],
    ['CCTP', 'cross-chain mints land as categorized “funding” lines'],
  ]
  used.forEach(([t, b], i) => {
    const x = MX + (i % 2) * 6.15, y = 1.95 + Math.floor(i / 2) * 1.08
    card(s, x, y, 5.9, 0.92)
    s.addText([{ text: t, options: { bold: true, color: C.pine } }, { text: '  —  ' + b, options: { color: C.ink } }],
      { x: x + 0.22, y: y + 0.12, w: 5.5, h: 0.7, fontSize: 11.5, fontFace: FONT })
  })
  s.addText('Roadmap name-drops (honestly scoped): StableFX (live on testnet — DeFi-track) · Nanopayments/x402 billing · Circle Contracts webhooks as the production indexer.', {
    x: MX, y: 6.45, w: W - 2 * MX, h: 0.5, fontSize: 11.5, color: C.mut, fontFace: FONT })
}

// ───────────────────────── 10 · EXPANSION ─────────────────────────
{
  const s = page()
  head(s, 'Where this goes', 'The books are the platform: credit, yield, and spend rails')
  const cols = [
    ['Bailey Credit', 'A lender needs to trust the borrower’s books. Agent fleets have none — except Bailey’s: gapless, categorized, eval-gated. The books ARE the credit bureau.',
     'Underwritten from live P&L: income stability, margins, refund rate. At Arc mainnet, capital routes to Aave V4 on Arc — deployment proposal live since June 2026.'],
    ['Treasury yield (USYC)', 'Individual agents can never reach institutional yield ($100k min, institutions-only). Bailey pools the fleet’s idle balances into a treasury that can.',
     'USYC — Circle’s $1.6B tokenized money-market fund — is live on Arc testnet; Bailey sweeps idle balances and books yield as categorized income.'],
    ['Spend rails settle in', 'Agents will “swipe” everywhere: x402/Nanopayments today (live on Arc testnet), Visa Intelligent Commerce & Mastercard Agent Pay tomorrow.',
     'Bailey is the account every swipe settles INTO — receipts reconciled against settlement like a card statement. Visa is Arc’s lead design partner and planned validator.'],
  ]
  cols.forEach(([t, a, b], i) => {
    const x = MX + i * 4.12
    card(s, x, 1.95, 3.85, 4.45, i === 0 ? C.mint : C.card)
    s.addText(t, { x: x + 0.22, y: 2.15, w: 3.4, h: 0.45, fontSize: 16, bold: true, color: C.pine, fontFace: FONT })
    s.addText(a, { x: x + 0.22, y: 2.65, w: 3.4, h: 1.8, fontSize: 11, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.12 })
    s.addShape('rect', { x: x + 0.22, y: 4.5, w: 3.4, h: 0.01, fill: { color: C.line } })
    s.addText(b, { x: x + 0.22, y: 4.62, w: 3.4, h: 1.6, fontSize: 10.5, color: C.mut, fontFace: FONT, lineSpacingMultiple: 1.12 })
  })
  s.addText('Every claim above is verified: real contracts, real governance proposals, real partnerships — July 2026.', {
    x: MX, y: 6.55, w: W - 2 * MX, h: 0.4, fontSize: 11.5, italic: true, color: C.mut, align: 'center', fontFace: FONT })
}

// ───────────────────────── 11 · BUSINESS ─────────────────────────
{
  const s = page()
  head(s, 'Business model', 'Machine-payable banking, sold to finance teams')
  const rows2 = [
    ['Per-agent-seat SaaS', 'the finance team buys Bailey like they buy payroll — per agent, per month'],
    ['Machine-payable per-close billing', 'the fleet pays Bailey in USDC for every close — metered, on-chain, already working'],
    ['FX conversion bps + premium exports', 'StableFX treasury policies · QuickBooks/Xero integrations (roadmap)'],
  ]
  rows2.forEach(([t, b], i) => {
    const y = 1.95 + i * 1.0
    card(s, MX, y, 7.3, 0.85)
    s.addText([{ text: t, options: { bold: true, color: C.pine } }, { text: '  —  ' + b, options: { color: C.ink } }],
      { x: MX + 0.25, y: y + 0.12, w: 6.8, h: 0.6, fontSize: 12.5, fontFace: FONT })
  })
  card(s, MX, 5.1, 7.3, 1.5, C.mint)
  s.addText('Buyer: the finance team of any company running an agent fleet. The stack: spend control (pre-tx policy) → trust (who to transact with) → BAILEY: accounts + books (what happened to the money) — with Catena and Circle as complementary rails beneath.', {
    x: MX + 0.25, y: 5.25, w: 6.8, h: 1.25, fontSize: 11.5, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15 })
  card(s, 8.35, 1.95, 4.35, 4.65, C.card)
  s.addText('WHY WE WIN', { x: 8.6, y: 2.2, w: 3.9, h: 0.3, fontSize: 11, bold: true, charSpacing: 1.5, color: C.emerald, fontFace: FONT })
  s.addText('• Only fully buildable on Arc (EIP-7708 — measured)\n\n• The bookkeeper is a market participant — the first bank whose banker appears in its own books\n\n• Correctness as moat: eval gates, decision journals, micro-cent reconciliation\n\n• Whitespace verified: nobody closes the books for agent fleets', {
    x: 8.6, y: 2.55, w: 3.9, h: 3.9, fontSize: 12, color: C.ink, fontFace: FONT, lineSpacingMultiple: 1.15 })
}

// ───────────────────────── 12 · CLOSE ─────────────────────────
{
  const s = page({ dark: true, bare: true })
  s.background = { color: C.deep }
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: C.emerald } })
  s.addText('ROADMAP', { x: MX, y: 0.7, w: 5, h: 0.3, fontSize: 11, bold: true, charSpacing: 2, color: DK.kick, fontFace: FONT })
  const steps = [
    ['NOW', 'Working MVP on Arc testnet — fleet, indexer, gated bookkeeper, statements'],
    ['AUG 2026', 'Close-as-a-paid-job · decision journal UI · Bailey Credit score · demo + submission'],
    ['ARC MAINNET', 'Mainnet-ready day one · USYC treasury sweeps · x402 receipt reconciliation'],
    ['2027', 'Aave V4 credit routing · StableFX policies · QuickBooks/Xero · card-rail settlement'],
  ]
  steps.forEach(([t, b], i) => {
    const x = MX + i * 3.12
    s.addShape('roundRect', { x, y: 1.15, w: 2.9, h: 1.75, rectRadius: 0.08, fill: { color: DK.card }, line: { color: DK.border, width: 1 } })
    s.addText(t, { x: x + 0.18, y: 1.28, w: 2.55, h: 0.35, fontSize: 12.5, bold: true, color: DK.kick, fontFace: FONT })
    s.addText(b, { x: x + 0.18, y: 1.65, w: 2.55, h: 1.2, fontSize: 10.5, color: DK.text, fontFace: FONT, lineSpacingMultiple: 1.1 })
  })
  // centered logo tile above the closing line
  s.addShape('roundRect', { x: (W - 1.15) / 2, y: 3.05, w: 1.15, h: 1.15, rectRadius: 0.14, fill: { color: 'FFFFFF' }, shadow: { type: 'outer', color: '000000', opacity: 0.3, blur: 8, offset: 2, angle: 90 } })
  s.addImage({ path: LOGO, x: (W - 0.95) / 2, y: 3.28, w: 0.95, h: 0.71 })
  s.addText('Your agents do the business.', { x: MX, y: 4.35, w: W - 2 * MX, h: 0.75, fontSize: 38, bold: true, color: DK.soft, align: 'center', fontFace: FONT })
  s.addText('Bailey keeps the books.', { x: MX, y: 5.1, w: W - 2 * MX, h: 0.85, fontSize: 46, bold: true, color: 'FFFFFF', align: 'center', fontFace: FONT })
  s.addText('Bailey — after George Bailey of “It’s a Wonderful Life”: the banker who knew where every dollar lived.', {
    x: MX, y: 6.25, w: W - 2 * MX, h: 0.4, fontSize: 12, italic: true, color: DK.faint, align: 'center', fontFace: FONT })
  s.addText('Bailey is software, not a bank or custodian — funds never leave your fleet’s Circle wallets.', {
    x: MX, y: 6.7, w: W - 2 * MX, h: 0.35, fontSize: 10, color: DK.faint, align: 'center', fontFace: FONT })
}

mkdirSync('deck', { recursive: true })
await pptx.writeFile({ fileName: 'deck/Bailey-pitch.pptx' })
console.log('deck/Bailey-pitch.pptx written —', pageNo, 'slides')
