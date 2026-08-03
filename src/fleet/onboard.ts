// Fleet onboarding — the Circle Wallets SDK flow, live-verified pattern (plan/03-architecture.md):
// wallet set → N agent SCA wallets + Bailey's own banker wallet (ARC-TESTNET, Gas Station
// sponsors fees) → optional ERC-8004 identity registration for every wallet, Bailey included
// (plan/06-ai-neobank.md item a). createWallets is NOT idempotent, so fleet.json is the reuse
// guard — delete it or pass --force to provision a fresh fleet.
// Usage: npm run fleet:onboard -- [--agents 5] [--identities] [--force]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'

// The Circle SDK is CJS and its named exports defeat Node's ESM static detection under tsx —
// createRequire is the reliable path (typing preserved via typeof import).
const require = createRequire(import.meta.url)
const { initiateDeveloperControlledWalletsClient } =
  require('@circle-fin/developer-controlled-wallets') as typeof import('@circle-fin/developer-controlled-wallets')
import { loadEnv, requireEnv } from '../env.js'
import { ADDRESSES } from '../config.js'
import { sleep, TX_PACE_MS } from '../retry.js'
import { openLedger, upsertAccount } from '../indexer/db.js'

const FLEET_FILE = 'fleet.json'

interface FleetWallet { id: string; address: string; name: string; role: 'agent' | 'banker' }
interface Fleet { walletSetId: string; wallets: FleetWallet[]; identities?: Record<string, string> }

function flag(name: string): boolean { return process.argv.includes(`--${name}`) }
function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

async function main() {
  loadEnv()
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: requireEnv('CIRCLE_API_KEY'),
    entitySecret: requireEnv('CIRCLE_ENTITY_SECRET'),
  })

  let fleet: Fleet
  if (existsSync(FLEET_FILE) && !flag('force')) {
    fleet = JSON.parse(readFileSync(FLEET_FILE, 'utf8'))
    console.log(`fleet.json exists — reusing ${fleet.wallets.length} wallets (pass --force for a fresh fleet)`)
  } else {
    const agentCount = Number(arg('agents', '5'))
    const names = [...Array.from({ length: agentCount }, (_, i) => `agent-${i + 1}`), 'bailey-banker']

    const setRes = await client.createWalletSet({ name: 'bailey-fleet' })
    const walletSetId = setRes.data?.walletSet?.id
    if (!walletSetId) throw new Error(`createWalletSet failed: ${JSON.stringify(setRes.data)}`)
    console.log(`wallet set: ${walletSetId}`)

    const walletsRes = await client.createWallets({
      walletSetId,
      blockchains: ['ARC-TESTNET'],
      accountType: 'SCA',
      count: names.length,
      metadata: names.map(name => ({ name, refId: `bailey:${name}` })),
    })
    const created = walletsRes.data?.wallets ?? []
    if (created.length !== names.length) throw new Error(`expected ${names.length} wallets, got ${created.length}`)

    fleet = {
      walletSetId,
      wallets: created.map((w, i) => ({
        id: w.id, address: w.address.toLowerCase(), name: names[i],
        role: names[i] === 'bailey-banker' ? 'banker' : 'agent',
      })),
    }
    writeFileSync(FLEET_FILE, JSON.stringify(fleet, null, 2))
    console.log(`created ${fleet.wallets.length} SCA wallets on ARC-TESTNET (Gas Station sponsors their gas):`)
  }
  for (const w of fleet.wallets) console.log(`  ${w.name.padEnd(14)} ${w.address} (${w.role})`)

  const db = openLedger()
  for (const w of fleet.wallets) upsertAccount(db, w.address, w.name, w.role)
  console.log('accounts registered in the ledger')

  if (flag('identities')) {
    fleet.identities ??= {}
    for (const w of fleet.wallets) {
      if (fleet.identities[w.address]) continue
      const uri = `data:application/json,${encodeURIComponent(JSON.stringify({ name: w.name, role: w.role, project: 'bailey' }))}`
      console.log(`registering ERC-8004 identity for ${w.name}…`)
      const txRes = await client.createContractExecutionTransaction({
        walletId: w.id,
        contractAddress: ADDRESSES.erc8004Identity,
        abiFunctionSignature: 'register(string)',
        abiParameters: [uri],
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
      })
      const txId = txRes.data?.id
      if (!txId) throw new Error(`createContractExecutionTransaction failed for ${w.name}`)
      // poll until COMPLETE (live-verified pattern); pacing keeps us inside the RPC/API quotas
      for (let i = 0; i < 60; i++) {
        await sleep(Math.max(TX_PACE_MS, 2000))
        const st = await client.getTransaction({ id: txId })
        const state = st.data?.transaction?.state
        if (state === 'COMPLETE') {
          fleet.identities[w.address] = st.data?.transaction?.txHash ?? 'complete'
          console.log(`  ${w.name}: identity registered (${fleet.identities[w.address]})`)
          break
        }
        if (state === 'FAILED' || state === 'CANCELLED' || state === 'DENIED') {
          throw new Error(`identity tx for ${w.name} ended ${state}`)
        }
      }
      writeFileSync(FLEET_FILE, JSON.stringify(fleet, null, 2))
    }
  }

  console.log('\nonboarding done. Fund the agents at https://faucet.circle.com, then: npm run index -- --watch <addresses>')
}

main().catch(err => { console.error('onboarding failed:', err); process.exit(1) })
