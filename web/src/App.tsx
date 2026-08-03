import Cutaway from './Cutaway'
import LiveView from './LiveView'

const TICKER = [
  '21% of USDC transfers are invisible to ERC-20 indexers — Bailey sees every one',
  'fleet books balanced to the micro-cent: 100.000000 USDC',
  '6 Circle SCA wallets live on Arc testnet',
  'golden-set eval gate: DeepSeek 12/12 · GPT-4o-mini 11/12',
  'the banker appears in its own books',
  'gas fully sponsored — agents never touch a gas token',
]

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__in">
          <img className="topbar__logo" src="/bailey-logo.png" alt="Bailey" />
          <span className="topbar__word">Bailey</span>
          <span className="topbar__no">№ 0001 — ARC TESTNET</span>
          <nav>
            <a href="#banque">The Bank</a>
            <a href="#coupe">The Cutaway</a>
            <a href="#direct" className="cta">● Live View</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="banque">
        <div className="wrap">
          <div className="hero__kicker reveal d1">
            <span className="line" />
            <span className="micro">Encode × Circle — Agentic Economy</span>
          </div>
          <h1 className="reveal d2">
            A bank whose clients<br />are <span className="coin-word">robots.</span>
          </h1>
          <p className="hero__sub reveal d3">
            Fleets of AI agents earn and spend USDC around the clock on Arc. They have wallets and
            explorers — but no per-agent accounts, no statements, no month-end books, nothing an
            accountant can file. <strong>Bailey gives every agent a real bank account — and the
            banker is an AI agent too.</strong>
          </p>
          <p className="hero__tag reveal d4">Your agents do the business. <b>Bailey keeps the books.</b></p>
          <div className="hero__actions reveal d5">
            <a className="btn btn--solid" href="#direct"><span className="dot" />Step inside the bank</a>
            <a className="btn btn--ghost" href="#coupe">How it works</a>
          </div>
          <div className="hero__coinline" aria-hidden="true"><span className="coin" /></div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map(k => (
            <span key={k}>{TICKER.map((t, i) => <i key={i}> {t} ·</i>)}</span>
          ))}
        </div>
      </div>

      <section className="story">
        <div className="wrap">
          <div className="story__grid">
            <div>
              <span className="micro micro--ink">Chapter one — the problem</span>
              <h2>The agent economy runs on money nobody can account for.</h2>
            </div>
            <div className="story__lede">
              <p>
                On Ethereum, a native transfer emits no log — a bank statement built from events
                silently misses it. On Arc, <strong>every native USDC movement emits a Transfer
                log</strong> (EIP-7708). We measured it on the live chain: one in five USDC
                movements is invisible to a normal indexer. Bailey&apos;s ledger reads the system
                emitter itself, so its statements are <strong>gapless by construction</strong>.
              </p>
              <p>
                Every number on a Bailey statement is chain-derived — deterministic, auditable,
                reproducible. The AI bookkeeper only fills the category column, behind a
                golden-set accuracy gate. When it isn&apos;t sure, it escalates. It never guesses.
              </p>
              <div className="story__quote">“Your accountant cannot file a block explorer.”</div>
            </div>
          </div>
          <div className="facts">
            <div className="fact"><b>21%</b><span>of USDC-moving transactions emit no ERC-20 log — measured live on Arc testnet, captured completely by Bailey.</span></div>
            <div className="fact"><b>100.000000</b><span>the fleet&apos;s books balance to the micro-cent — every internal payment cancels exactly.</span></div>
            <div className="fact"><b>12/12</b><span>golden-set gate passed before any model may touch the ledger. Two vendors, same verdicts.</span></div>
          </div>
        </div>
      </section>

      <section className="cut" id="coupe">
        <div className="wrap">
          <span className="micro micro--ink">Chapter two — the cutaway</span>
          <h2>Inside the bank: a cross-section.</h2>
          <div className="cut__frame">
            <Cutaway />
            <div className="cut__caption">
              <span><em>Fig. 1</em> — Agents transact on the top floor; the indexer catches every coin; Bailey closes the books in the vault.</span>
              <span className="micro micro--ink">coins = live USDC movements</span>
            </div>
          </div>
        </div>
      </section>

      <LiveView />

      <footer className="footer">
        <div className="wrap footer__grid">
          <div>
            <div className="footer__brand">
              <img src="/bailey-logo.png" alt="" />
              <b>Bailey</b>
            </div>
            <p style={{ marginTop: 14 }}>
              Built for the Encode × Circle Programmable Money Hackathon — Agentic Economy track.
              Circle Wallets (dev-controlled SCA) · Gas Station · native USDC · ERC-8004 identities ·
              ERC-8183 job escrow · EIP-7708 ledger.
            </p>
            <p className="legal">
              Bailey is software, not a bank or custodian — funds never leave your fleet&apos;s
              Circle wallets. Named after George Bailey of &quot;It&apos;s a Wonderful Life&quot; —
              the banker who knew where every dollar lived.
            </p>
          </div>
          <p>
            Your agents do the business.<br />Bailey keeps the books.
          </p>
        </div>
      </footer>
    </>
  )
}
