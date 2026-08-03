// Public Arc RPC returns quota errors as JSON-RPC errors that viem will not retry.
// App-level retry with exponential backoff is mandatory around every RPC call.
const QUOTA_RE = /request limit|rate limit|limit reached|limit exceeded|429|too many/i

export async function withRpcRetry<T>(fn: () => Promise<T>, attempts = 6): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const msg = err instanceof Error ? err.message : String(err)
      if (!QUOTA_RE.test(msg)) throw err
      const delay = Math.min(60_000, 8_000 * 2 ** i)
      console.warn(`  [rpc] quota hit, retry ${i + 1}/${attempts} in ${delay / 1000}s`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

// Pinned fees skip estimation round-trips. Values proven pre-v0.7.2 — the day-1 spike
// re-validates them before any tx-sending code relies on them (plan/03-architecture.md).
export const ARC_FEES = {
  maxFeePerGas: 40_000_000_000n, // 40 gwei (testnet min base fee ~20 gwei; below it txs hang)
  maxPriorityFeePerGas: 1_000_000_000n, // 1 gwei
} as const

export const ARC_GAS_LIMIT = 900_000n

export const TX_PACE_MS = Number(process.env.TX_PACE_MS ?? 1200)

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
