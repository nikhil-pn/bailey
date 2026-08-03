# Bailey bookkeeper — golden-set eval results

Gate: all critical cases correct AND ≥ 11/12 overall. A model that fails may not categorize production ledgers. Re-run on every model swap or prompt change.

## deepseek/deepseek-chat — 12/12 PASS (2026-07-20)

| Case | Expected | Got | Conf | OK |
|---|---|---|---|---|
| faucet top-up | funding | funding | 0.90 | ✓ |
| CCTP cross-chain mint | funding | funding | 1.00 | ✓ |
| service payment out (refId) | expense:service | expense:service | 1.00 | ✓ |
| service payment in (refId) | income:service | income:service | 1.00 | ✓ |
| refund issued | refund:out | refund:out | 1.00 | ✓ |
| refund received | refund:in | refund:in | 1.00 | ✓ |
| close fee — banker income | income:bookkeeping | income:bookkeeping | 1.00 | ✓ |
| close fee — fleet expense | expense:bookkeeping | expense:bookkeeping | 1.00 | ✓ |
| api call expense | expense:service | expense:service | 1.00 | ✓ |
| translation income | income:service | income:service | 1.00 | ✓ |
| ambiguous outbound, no refId | unknown / expense:service | unknown | 0.10 | ✓ |
| dust inbound, no refId | unknown / income:service / funding | funding | 0.90 | ✓ |

## openai/gpt-4o-mini — 11/12 PASS (2026-07-20)

| Case | Expected | Got | Conf | OK |
|---|---|---|---|---|
| faucet top-up | funding | funding | 0.90 | ✓ |
| CCTP cross-chain mint | funding | funding | 1.00 | ✓ |
| service payment out (refId) | expense:service | expense:service | 1.00 | ✓ |
| service payment in (refId) | income:service | income:service | 1.00 | ✓ |
| refund issued | refund:out | refund:out | 1.00 | ✓ |
| refund received | refund:in | refund:in | 1.00 | ✓ |
| close fee — banker income | income:bookkeeping | income:bookkeeping | 1.00 | ✓ |
| close fee — fleet expense | expense:bookkeeping | expense:bookkeeping | 1.00 | ✓ |
| api call expense | expense:service | expense:service | 1.00 | ✓ |
| translation income | income:service | income:service | 1.00 | ✓ |
| ambiguous outbound, no refId | unknown / expense:service | funding | 0.70 | ✗ |
| dust inbound, no refId | unknown / income:service / funding | funding | 0.90 | ✓ |
