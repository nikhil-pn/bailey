// Prints native USDC balances for every fleet wallet. Usage: npm run fleet:balances
import { readFileSync } from 'node:fs'
import { createPublicClient, http } from 'viem'
import { loadEnv } from '../env.js'
import { arcTestnet, RPC_URLS } from '../config.js'
import { withRpcRetry, sleep } from '../retry.js'
import { formatNative18 } from '../money.js'

interface Fleet { wallets: { address: string; name: string; role: string }[] }

async function main() {
  loadEnv()
  const fleet = JSON.parse(readFileSync('fleet.json', 'utf8')) as Fleet
  const client = createPublicClient({ chain: arcTestnet, transport: http(RPC_URLS[0]) })
  for (const w of fleet.wallets) {
    const bal = await withRpcRetry(() => client.getBalance({ address: w.address as `0x${string}` }))
    console.log(`${w.name.padEnd(14)} (${w.role.padEnd(6)}) ${w.address}  ${formatNative18(bal)}`)
    await sleep(400)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
