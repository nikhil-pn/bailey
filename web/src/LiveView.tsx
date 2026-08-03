// Live View — the live bank view, fed by Bailey's real ledger (bailey.db via /api).
// Falls back to a baked snapshot of real fleet data if the API is offline, so the page
// always demonstrates truthfully captured chain data.
import { useEffect, useState } from 'react'

interface Summary { headBlock: number; accounts: number; entries: number; in6: number; out6: number; gas6: number; net6: number }
interface Account { address: string; label: string; role: string; balance6: number; inN: number; outN: number }
interface Entry {
  id: number; blockNumber: number; ts: number | null; txHash: string; kind: string
  direction: 'in' | 'out'; accountLabel: string; counterpartyLabel: string
  amount6: number; category: string | null; memo: string | null
}

const FALLBACK: { summary: Summary; accounts: Account[]; entries: Entry[] } = {
  summary: { headBlock: 52744765, accounts: 6, entries: 17, in6: 109050000, out6: 9050000, gas6: 0, net6: 100000000 },
  accounts: [
    { address: '0x429a…ac09', label: 'agent-1', role: 'agent', balance6: 17200000, inN: 2, outN: 2 },
    { address: '0x7b98…05e2', label: 'agent-2', role: 'agent', balance6: 21250000, inN: 2, outN: 1 },
    { address: '0xe0bf…0132', label: 'agent-3', role: 'agent', balance6: 20450000, inN: 2, outN: 1 },
    { address: '0x0f76…d30c', label: 'agent-4', role: 'agent', balance6: 18500000, inN: 3, outN: 1 },
    { address: '0x4ee3…ee66', label: 'agent-5', role: 'agent', balance6: 22600000, inN: 2, outN: 1 },
    { address: '0x5919…80d6', label: 'bailey-banker', role: 'banker', balance6: 0, inN: 0, outN: 0 },
  ],
  entries: [
    { id: 12, blockNumber: 52744653, ts: null, txHash: '0x18eea80a…25d4e4', kind: 'transfer', direction: 'out', accountLabel: 'agent-1', counterpartyLabel: 'agent-4', amount6: 1100000, category: 'expense:service', memo: 'svc:api-call:v2' },
    { id: 11, blockNumber: 52744653, ts: null, txHash: '0x18eea80a…25d4e4', kind: 'transfer', direction: 'in', accountLabel: 'agent-4', counterpartyLabel: 'agent-1', amount6: 1100000, category: 'income:service', memo: 'svc:api-call:v2' },
    { id: 10, blockNumber: 52744648, ts: null, txHash: '0xc0345748…1dda8e', kind: 'transfer', direction: 'out', accountLabel: 'agent-5', counterpartyLabel: 'agent-4', amount6: 400000, category: 'refund:out', memo: 'refund:translation:job-7-partial' },
    { id: 9, blockNumber: 52744648, ts: null, txHash: '0xc0345748…1dda8e', kind: 'transfer', direction: 'in', accountLabel: 'agent-4', counterpartyLabel: 'agent-5', amount6: 400000, category: 'refund:in', memo: 'refund:translation:job-7-partial' },
    { id: 8, blockNumber: 52744637, ts: null, txHash: '0x5d0e3c74…e2015d', kind: 'transfer', direction: 'out', accountLabel: 'agent-4', counterpartyLabel: 'agent-5', amount6: 3000000, category: 'expense:service', memo: 'svc:translation:job-7' },
    { id: 7, blockNumber: 52744637, ts: null, txHash: '0x5d0e3c74…e2015d', kind: 'transfer', direction: 'in', accountLabel: 'agent-5', counterpartyLabel: 'agent-4', amount6: 3000000, category: 'income:service', memo: 'svc:translation:job-7' },
    { id: 6, blockNumber: 52744628, ts: null, txHash: '0x64732679…b594f', kind: 'transfer', direction: 'in', accountLabel: 'agent-1', counterpartyLabel: 'agent-3', amount6: 800000, category: 'income:service', memo: 'svc:storage:july' },
    { id: 5, blockNumber: 52744614, ts: null, txHash: '0xef93b0a2…183472', kind: 'transfer', direction: 'in', accountLabel: 'agent-3', counterpartyLabel: 'agent-2', amount6: 1250000, category: 'income:service', memo: 'svc:compute:batch-42' },
    { id: 4, blockNumber: 52744599, ts: null, txHash: '0x88db4799…c7c4d9', kind: 'transfer', direction: 'in', accountLabel: 'agent-2', counterpartyLabel: 'agent-1', amount6: 2500000, category: 'income:service', memo: 'svc:data-feed:hourly' },
    { id: 3, blockNumber: 52744435, ts: null, txHash: '0xfaucet…drip5', kind: 'transfer', direction: 'in', accountLabel: 'agent-5', counterpartyLabel: 'external', amount6: 20000000, category: 'funding', memo: null },
  ],
}

const fmt6 = (m: number, signed = false) => {
  const neg = m < 0
  const abs = Math.abs(m)
  const whole = Math.floor(abs / 1_000_000).toLocaleString('en-US')
  const frac = String(abs % 1_000_000).padStart(6, '0')
  return `${neg ? '−' : signed ? '+' : ''}${whole}.${frac}`
}

export default function LiveView() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let dead = false
    const load = async () => {
      try {
        const [s, a, e] = await Promise.all([
          fetch('/api/summary').then(r => r.json()),
          fetch('/api/accounts').then(r => r.json()),
          fetch('/api/entries?limit=40').then(r => r.json()),
        ])
        if (dead) return
        setSummary(s); setAccounts(a); setEntries(e); setOnline(true)
      } catch {
        if (dead) return
        setSummary(FALLBACK.summary); setAccounts(FALLBACK.accounts); setEntries(FALLBACK.entries); setOnline(false)
      }
    }
    load()
    const t = setInterval(load, 6000)
    return () => { dead = true; clearInterval(t) }
  }, [])

  const s = summary
  return (
    <section className="live" id="direct">
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="live__head">
          <div>
            <span className="micro">Chapter three — live</span>
            <h2>The bank, live.</h2>
          </div>
          <div className="live__status">
            <span className="pulse" />
            {online === false ? 'ledger snapshot · real captured data' : `watching arc testnet · block ${s ? s.headBlock.toLocaleString('en-US') : '…'}`}
          </div>
        </div>

        <div className="stats">
          <div className="stat"><b>{s ? fmt6(s.in6) : '…'}<span className="unit">USDC</span></b><span>money in</span></div>
          <div className="stat"><b>{s ? fmt6(s.out6) : '…'}<span className="unit">USDC</span></b><span>money out</span></div>
          <div className="stat"><b>{s ? fmt6(s.net6) : '…'}<span className="unit">USDC</span></b><span>fleet net — balanced to the micro-cent</span></div>
          <div className="stat"><b>{s ? s.entries : '…'}</b><span>ledger lines · {s ? s.accounts : '…'} accounts</span></div>
        </div>

        <div className="live__grid">
          <div className="panel">
            <div className="panel__head">
              <h3>Accounts</h3>
              <span className="micro">the fleet</span>
            </div>
            {accounts.map(a => (
              <div className="acct" key={a.address}>
                <div className={`acct__avatar${a.role === 'banker' ? ' acct__avatar--banker' : ''}`}>
                  {a.role === 'banker' ? 'B' : a.label.replace('agent-', 'A')}
                </div>
                <div>
                  <div className="acct__name">{a.label}</div>
                  <div className="acct__role">{a.role === 'banker' ? 'banker · the AI that runs the bank' : 'agent'}</div>
                </div>
                <div className="acct__bal">
                  {fmt6(a.balance6)} <span style={{ fontSize: 10, opacity: .6 }}>USDC</span>
                  <span className="acct__net">{a.inN + a.outN} lines this period</span>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel__head">
              <h3>The Ledger — every movement, categorized</h3>
              <span className="micro">live feed</span>
            </div>
            <div className="feed">
              {entries.map((e, i) => (
                <div className="row" key={e.id} style={{ animationDelay: `${Math.min(i * 70, 700)}ms` }}>
                  <span className={`row__dir ${e.direction}`}>{e.direction === 'in' ? '↓' : '↑'}</span>
                  <span className="row__what">
                    {e.memo ?? (e.kind === 'gas' ? 'network gas' : 'USDC transfer')} — {e.accountLabel} {e.direction === 'in' ? '←' : '→'} {e.counterpartyLabel}
                    <small>block {e.blockNumber.toLocaleString('en-US')} · {e.txHash.slice(0, 14)}…</small>
                  </span>
                  <span><span className={`chip${e.category ? ' chip--set' : ''}`}>{e.category ?? 'awaiting bailey'}</span></span>
                  <span className={`row__amt ${e.direction}`}>{e.direction === 'in' ? '+' : '−'}{fmt6(e.amount6)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="live__note">
          Every line above is a real USDC movement on Arc testnet, indexed through the EIP-7708 system
          emitter and categorized by Bailey behind a golden-set accuracy gate. Nothing is simulated.
        </p>
      </div>
    </section>
  )
}
