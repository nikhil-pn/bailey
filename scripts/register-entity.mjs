// One-time Circle setup (step 0 of onboarding, plan/03-architecture.md):
// generates a 32-byte Entity Secret locally, registers it with Circle, writes it to .env.
// The recovery file lands in gitignored .circle/. Run: npm run register-entity
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets'

const env = existsSync('.env') ? readFileSync('.env', 'utf8') : ''
const get = (k) => (env.match(new RegExp(`^${k}=(.+)$`, 'm')) ?? [])[1]?.trim()

const apiKey = process.env.CIRCLE_API_KEY ?? get('CIRCLE_API_KEY')
if (!apiKey) {
  console.error('CIRCLE_API_KEY missing — put it in .env first (copy .env.example)')
  process.exit(1)
}
if (process.env.CIRCLE_ENTITY_SECRET ?? get('CIRCLE_ENTITY_SECRET')) {
  console.log('CIRCLE_ENTITY_SECRET already set — nothing to do (never re-register an active secret).')
  process.exit(0)
}

const entitySecret = randomBytes(32).toString('hex')
mkdirSync('.circle', { recursive: true })
await registerEntitySecretCiphertext({ apiKey, entitySecret, recoveryFileDownloadPath: '.circle' })
appendFileSync('.env', `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`)
console.log('Entity Secret registered with Circle and written to .env; recovery file saved under .circle/ (gitignored).')
