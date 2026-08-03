// Funds the fleet's agent wallets with testnet USDC via Circle's faucet API
// (POST /v1/faucet/drips), with pacing + rate-limit retry. Bailey's banker wallet is
// deliberately NOT funded — its first income should be the close fee it earns.
// Usage: npm run fleet:faucet
import { readFileSync } from 'node:fs'
import { createPublicClient, http } from 'viem'
import { loadEnv, requireEnv } from '../env.js'
import { arcTestnet, RPC_URLS } from '../config.js'
import { sleep } from '../retry.js'
import { formatNative18 } from '../money.js'

interface Fleet { wallets: { address: string; name: string; role: string }[] }

async function drip(apiKey: string, address: string): Promise<'ok' | 'rate-limited' | string> {
  const res = await fetch('https://api.circle.com/v1/faucet/drips', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockchain: 'ARC-TESTNET', address, usdc: true }),
  })
  if (res.ok) return 'ok'
  const body = await res.text()
  if (res.status === 429 || /rate limit/i.test(body)) return 'rate-limited'
  return `${res.status}: ${body}`
}

async function main() {
  loadEnv()
  const apiKey = requireEnv('CIRCLE_API_KEY')
  const fleet = JSON.parse(readFileSync('fleet.json', 'utf8')) as Fleet
  const agents = fleet.wallets.filter(w => w.role === 'agent')

  for (const w of agents) {
    let done = false
    for (let attempt = 0; attempt < 6 && !done; attempt++) {
      const r = await drip(apiKey, w.address)
      if (r === 'ok') {
        console.log(`${w.name}: drip requested ✓`)
        done = true
      } else if (r === 'rate-limited') {
        console.log(`${w.name}: rate-limited, waiting 65s (attempt ${attempt + 1}/6)…`)
        await sleep(65_000)
      } else {
        console.log(`${w.name}: FAILED — ${r}`)
        break
      }
    }
    await sleep(20_000)
  }

  console.log('\nwaiting 30s for drips to land, then checking balances…')
  await sleep(30_000)
  const client = createPublicClient({ chain: arcTestnet, transport: http(RPC_URLS[0]) })
  for (const w of fleet.wallets) {
    const bal = await client.getBalance({ address: w.address as `0x${string}` })
    console.log(`${w.name.padEnd(14)} ${w.address}  ${formatNative18(bal)}`)
    await sleep(500)
  }
}

main().catch(err => { console.error('faucet failed:', err); process.exit(1) })
