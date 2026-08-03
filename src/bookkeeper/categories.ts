// Bailey's category taxonomy. Structurally-known kinds are categorized DETERMINISTICALLY —
// the chain already says what they are; the LLM only judges ambiguous transfer lines.
// Every number on a statement is chain-derived; the model only ever fills the category column.

export const LLM_CATEGORIES = [
  'funding',              // external top-up: faucet, treasury, CCTP cross-chain mint
  'income:service',       // payment received for services rendered
  'expense:service',      // payment made to another agent/provider for services
  'income:bookkeeping',   // Bailey's close fee (banker income)
  'expense:bookkeeping',  // the fleet paying Bailey for a close
  'refund:in',
  'refund:out',
  'unknown',              // model must use this rather than guess
] as const
export type LlmCategory = (typeof LLM_CATEGORIES)[number]

// kind -> category, confidence 1.0, never sent to the model
export const DETERMINISTIC: Record<string, string> = {
  'gas': 'expense:gas',
  'job:PaymentReleased': 'income:job',
  'job:JobFunded': 'expense:job-escrow',
  'job:Refunded': 'refund:in',
  'job:EvaluatorFeePaid': 'income:evaluation',
}

export interface LineInput {
  direction: 'in' | 'out'
  amountUsdc: string          // 6-dec decimal string
  counterparty: string        // fleet label, 'external', or 'zero-address (mint)'
  refId: string | null        // Circle transaction refId (off-chain context), if any
}

export interface Verdict {
  category: LlmCategory
  confidence: number          // 0..1
  rationale: string
}

export const SYSTEM_PROMPT = `You are the transaction categorizer inside Bailey, a neobank for fleets of AI agents on Arc (Circle's blockchain). Every ledger line you see belongs to one agent's account; amounts are USDC.

Assign exactly one category from this list:
${LLM_CATEGORIES.map(c => `- ${c}`).join('\n')}

Rules:
- "refId" is trusted off-chain context attached by the paying wallet (e.g. "svc:data-feed:hourly" = a service payment; "refund:..." = a refund; "close:..." = a bookkeeping/close fee).
- direction "in" + service-like refId -> income:service; direction "out" + service-like refId -> expense:service.
- refId starting with "refund" -> refund:in or refund:out by direction.
- refId starting with "close" or mentioning bookkeeping -> income:bookkeeping (in) / expense:bookkeeping (out).
- Incoming from "zero-address (mint)" is a cross-chain or issuance mint -> funding.
- Incoming round amounts from "external" with no refId are most often faucet/treasury top-ups -> funding.
- If genuinely ambiguous, use "unknown" with low confidence — never guess a confident wrong answer.

Respond with ONLY a JSON object: {"category": "...", "confidence": 0.0-1.0, "rationale": "one short sentence"}. No markdown, no extra text.`
