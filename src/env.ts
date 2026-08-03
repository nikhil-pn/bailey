import { readFileSync, existsSync } from 'node:fs'

// Minimal .env loader (no dotenv dependency). Existing process.env values win.
export function loadEnv(path = '.env') {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim()
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} missing — copy .env.example to .env and fill it in`)
  return v
}
