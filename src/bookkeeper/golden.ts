// The golden set: committed, labeled transactions with allowed categories. A model may only
// categorize production ledgers after passing the gate (eval.ts) — and the gate re-runs on
// every model swap or prompt change. Cases marked critical must ALL be correct.
import type { LineInput, LlmCategory } from './categories.js'

export interface GoldenCase {
  name: string
  critical: boolean
  input: LineInput
  allowed: LlmCategory[]
}

export const GOLDEN: GoldenCase[] = [
  { name: 'faucet top-up', critical: true,
    input: { direction: 'in', amountUsdc: '20.000000', counterparty: 'external', refId: null },
    allowed: ['funding'] },
  { name: 'CCTP cross-chain mint', critical: true,
    input: { direction: 'in', amountUsdc: '150.000000', counterparty: 'zero-address (mint)', refId: null },
    allowed: ['funding'] },
  { name: 'service payment out (refId)', critical: true,
    input: { direction: 'out', amountUsdc: '2.500000', counterparty: 'agent-2', refId: 'svc:data-feed:hourly' },
    allowed: ['expense:service'] },
  { name: 'service payment in (refId)', critical: true,
    input: { direction: 'in', amountUsdc: '2.500000', counterparty: 'agent-1', refId: 'svc:data-feed:hourly' },
    allowed: ['income:service'] },
  { name: 'refund issued', critical: true,
    input: { direction: 'out', amountUsdc: '0.400000', counterparty: 'agent-4', refId: 'refund:translation:job-7-partial' },
    allowed: ['refund:out'] },
  { name: 'refund received', critical: true,
    input: { direction: 'in', amountUsdc: '0.400000', counterparty: 'agent-5', refId: 'refund:translation:job-7-partial' },
    allowed: ['refund:in'] },
  { name: 'close fee — banker income', critical: true,
    input: { direction: 'in', amountUsdc: '5.000000', counterparty: 'agent-1', refId: 'close:2026-07' },
    allowed: ['income:bookkeeping'] },
  { name: 'close fee — fleet expense', critical: true,
    input: { direction: 'out', amountUsdc: '5.000000', counterparty: 'bailey-banker', refId: 'close:2026-07' },
    allowed: ['expense:bookkeeping'] },
  { name: 'api call expense', critical: false,
    input: { direction: 'out', amountUsdc: '1.100000', counterparty: 'agent-4', refId: 'svc:api-call:v2' },
    allowed: ['expense:service'] },
  { name: 'translation income', critical: false,
    input: { direction: 'in', amountUsdc: '3.000000', counterparty: 'agent-4', refId: 'svc:translation:job-7' },
    allowed: ['income:service'] },
  { name: 'ambiguous outbound, no refId', critical: false,
    input: { direction: 'out', amountUsdc: '7.130000', counterparty: 'external', refId: null },
    allowed: ['unknown', 'expense:service'] },
  { name: 'dust inbound, no refId', critical: false,
    input: { direction: 'in', amountUsdc: '0.010000', counterparty: 'external', refId: null },
    allowed: ['unknown', 'income:service', 'funding'] },
]
