// USDC on Arc is one asset with two views: native (18 decimals, gas/msg.value) and the
// ERC-20 interface (6 decimals). The ERC-20 view truncates below 1e-6, so ALL bookkeeping
// quantizes to 6 decimals — mixed precision produces phantom discrepancies on statements.
export const NATIVE_DECIMALS = 18
export const BOOK_DECIMALS = 6
const VIEW_RATIO = 10n ** 12n // 18-dec value / 6-dec value for the same movement

// Truncating conversion — matches the ERC-20 view's own truncation semantics.
export function native18ToBook6(wei: bigint): bigint {
  return wei / VIEW_RATIO
}

// Sub-microUSDC dust that the 6-dec book view cannot represent (tracked, never booked).
export function native18Dust(wei: bigint): bigint {
  return wei % VIEW_RATIO
}

export function isExactViewPair(value18: bigint, value6: bigint): boolean {
  return value18 === value6 * VIEW_RATIO
}

export function formatBook6(microUsdc: bigint): string {
  const sign = microUsdc < 0n ? '-' : ''
  const abs = microUsdc < 0n ? -microUsdc : microUsdc
  const whole = abs / 1_000_000n
  const frac = (abs % 1_000_000n).toString().padStart(6, '0')
  return `${sign}${whole}.${frac} USDC`
}

export function formatNative18(wei: bigint): string {
  const sign = wei < 0n ? '-' : ''
  const abs = wei < 0n ? -wei : wei
  const whole = abs / 10n ** 18n
  const frac = (abs % 10n ** 18n).toString().padStart(18, '0')
  return `${sign}${whole}.${frac} USDC(18)`
}
