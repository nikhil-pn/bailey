// The Cutaway — hand-drawn cross-section of the bank. Coins (live USDC movements) travel
// between agents, drop through the indexer chutes into the open ledger, and Bailey stamps the
// close in the vault. SMIL animateMotion + CSS keyframes; no runtime dependencies.
export default function Cutaway() {
  return (
    <svg className="cut__svg" viewBox="0 0 960 640" role="img" aria-label="Cross-section of the Bailey bank: agents transact, the indexer catches every coin, Bailey closes the books">
      <style>{`
        .agent { animation: bob 3.4s ease-in-out infinite; }
        .agent:nth-of-type(2n) { animation-delay: .7s; }
        .agent:nth-of-type(3n) { animation-delay: 1.3s; }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .write-line { stroke-dasharray: 64; stroke-dashoffset: 64; animation: write 3.2s linear infinite; }
        @keyframes write { 0% { stroke-dashoffset: 64; } 55%,100% { stroke-dashoffset: 0; } }
        .stamp-arm { transform-origin: 520px 512px; animation: stamp 2.6s ease-in-out infinite; }
        @keyframes stamp { 0%,55%,100% { transform: rotate(0deg); } 68%,78% { transform: rotate(24deg); } }
        .seal { opacity: 0; animation: seal 2.6s ease-in-out infinite; }
        @keyframes seal { 0%,70% { opacity: 0; } 80%,96% { opacity: 1; } 100% { opacity: 0; } }
        .clockhand { transform-origin: 480px 78px; animation: tick 12s linear infinite; }
        @keyframes tick { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── building shell ── */}
      {/* pediment */}
      <polygon points="120,110 480,44 840,110" fill="#fffdf6" stroke="#1e2867" strokeWidth="2" />
      <text x="480" y="102" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="17" letterSpacing="6" fill="#1e2867">BAILEY BANK</text>
      {/* coin clock in the pediment */}
      <circle cx="480" cy="78" r="13" fill="#ef5b36" stroke="#d74e2b" strokeWidth="2" />
      <line className="clockhand" x1="480" y1="78" x2="480" y2="69" stroke="#fffdf6" strokeWidth="2" strokeLinecap="round" />
      {/* walls */}
      <rect x="120" y="110" width="720" height="490" fill="#fffdf6" stroke="#1e2867" strokeWidth="2" />
      {/* columns */}
      <rect x="132" y="122" width="14" height="466" fill="none" stroke="#1e2867" strokeWidth="1.4" />
      <rect x="814" y="122" width="14" height="466" fill="none" stroke="#1e2867" strokeWidth="1.4" />
      {/* floor slabs */}
      <line x1="120" y1="280" x2="840" y2="280" stroke="#1e2867" strokeWidth="2" />
      <line x1="120" y1="450" x2="840" y2="450" stroke="#1e2867" strokeWidth="2" />
      {/* ground */}
      <line x1="70" y1="600" x2="890" y2="600" stroke="#1e2867" strokeWidth="2.5" />
      <line x1="70" y1="608" x2="890" y2="608" stroke="rgba(30,40,103,.3)" strokeWidth="1" />

      {/* ── floor labels ── */}
      <text x="160" y="146" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="10.5" letterSpacing="3" fill="#d74e2b">FLOOR 01 — THE AGENTS</text>
      <text x="160" y="160" fontFamily="Archivo, sans-serif" fontSize="9.5" fill="#5c608a">agents do the business, in USDC</text>
      <text x="160" y="316" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="10.5" letterSpacing="3" fill="#d74e2b">FLOOR 02 — THE LEDGER</text>
      <text x="160" y="330" fontFamily="Archivo, sans-serif" fontSize="9.5" fill="#5c608a">every coin caught by the EIP-7708 indexer</text>
      <text x="160" y="486" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="10.5" letterSpacing="3" fill="#d74e2b">THE VAULT — BAILEY</text>
      <text x="160" y="500" fontFamily="Archivo, sans-serif" fontSize="9.5" fill="#5c608a">decision gates · the close · the stamp</text>

      {/* ── floor 1: agents ── */}
      {[
        { x: 200, id: 1 }, { x: 330, id: 2 }, { x: 460, id: 3 }, { x: 590, id: 4 }, { x: 720, id: 5 },
      ].map(a => (
        <g className="agent" key={a.id}>
          {/* desk */}
          <line x1={a.x - 26} y1="262" x2={a.x + 26} y2="262" stroke="#1e2867" strokeWidth="2" />
          <line x1={a.x - 20} y1="262" x2={a.x - 20} y2="276" stroke="#1e2867" strokeWidth="1.4" />
          <line x1={a.x + 20} y1="262" x2={a.x + 20} y2="276" stroke="#1e2867" strokeWidth="1.4" />
          {/* body */}
          <rect x={a.x - 17} y="212" width="34" height="34" rx="8" fill="#1e2867" />
          {/* face screen + eyes */}
          <rect x={a.x - 11} y="220" width="22" height="12" rx="3" fill="#f6f3ea" />
          <circle cx={a.x - 5} cy="226" r="1.8" fill="#1e2867" />
          <circle cx={a.x + 5} cy="226" r="1.8" fill="#1e2867" />
          {/* antenna */}
          <line x1={a.x} y1="212" x2={a.x} y2="202" stroke="#1e2867" strokeWidth="1.6" />
          <circle cx={a.x} cy="199" r="3.4" fill="#ef5b36" />
          <text x={a.x} y="256" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#5c608a">agent-{a.id}</text>
        </g>
      ))}

      {/* payment arcs between agents (dashed) + traveling coins */}
      <path id="arcA" d="M 200 208 Q 330 158 460 208" fill="none" stroke="rgba(30,40,103,.35)" strokeWidth="1.2" strokeDasharray="4 5" />
      <path id="arcB" d="M 330 206 Q 525 148 720 206" fill="none" stroke="rgba(30,40,103,.35)" strokeWidth="1.2" strokeDasharray="4 5" />
      <path id="arcC" d="M 590 208 Q 460 166 330 208" fill="none" stroke="rgba(30,40,103,.35)" strokeWidth="1.2" strokeDasharray="4 5" />
      {[
        { href: '#arcA', dur: '3.8s', begin: '0s' },
        { href: '#arcB', dur: '5.2s', begin: '1.4s' },
        { href: '#arcC', dur: '4.4s', begin: '2.6s' },
      ].map((c, i) => (
        <circle key={i} r="6.5" fill="#ef5b36" stroke="#d74e2b" strokeWidth="1.6">
          <animateMotion dur={c.dur} begin={c.begin} repeatCount="indefinite">
            <mpath href={c.href} />
          </animateMotion>
        </circle>
      ))}

      {/* ── chutes from floor 1 into the ledger hall ── */}
      <path id="chute1" d="M 395 280 L 395 372 Q 395 390 412 390 L 585 402" fill="none" stroke="rgba(30,40,103,.3)" strokeWidth="1.2" strokeDasharray="3 5" />
      <path id="chute2" d="M 655 280 L 655 360 Q 655 380 640 386 L 618 396" fill="none" stroke="rgba(30,40,103,.3)" strokeWidth="1.2" strokeDasharray="3 5" />
      {[
        { href: '#chute1', dur: '3.4s', begin: '.8s' },
        { href: '#chute2', dur: '2.9s', begin: '2.2s' },
      ].map((c, i) => (
        <circle key={i} r="6" fill="#ef5b36" stroke="#d74e2b" strokeWidth="1.5">
          <animateMotion dur={c.dur} begin={c.begin} repeatCount="indefinite">
            <mpath href={c.href} />
          </animateMotion>
        </circle>
      ))}

      {/* ── floor 2: the open ledger ── */}
      {/* book */}
      <path d="M 480 430 Q 560 408 640 430 L 640 370 Q 560 348 480 370 Z" fill="#fffdf6" stroke="#1e2867" strokeWidth="2" />
      <path d="M 640 430 Q 720 408 800 430 L 800 370 Q 720 348 640 370 Z" fill="#fffdf6" stroke="#1e2867" strokeWidth="2" />
      <line x1="640" y1="370" x2="640" y2="430" stroke="#1e2867" strokeWidth="2" />
      {/* written lines appearing on the right page */}
      {[382, 392, 402, 412].map((y, i) => (
        <line key={y} className="write-line" x1="655" y1={y + 4} x2="785" y2={y}
          stroke={i === 1 ? '#ef5b36' : '#1e2867'} strokeWidth="1.6"
          style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
      {/* static lines on the left page */}
      {[382, 392, 402, 412].map(y => (
        <line key={y} x1="495" y1={y} x2="625" y2={y + 4} stroke="rgba(30,40,103,.4)" strokeWidth="1.2" />
      ))}
      <text x="480" y="368" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#5c608a">0xfffe…</text>

      {/* indexer box */}
      <rect x="240" y="360" width="130" height="66" rx="6" fill="none" stroke="#1e2867" strokeWidth="1.6" />
      <text x="305" y="386" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="10" letterSpacing="2" fill="#1e2867">INDEXER</text>
      <text x="305" y="402" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#5c608a">R1–R5 · dedupe</text>
      <circle cx="305" cy="414" r="3" fill="#ef5b36">
        <animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <line x1="370" y1="394" x2="475" y2="396" stroke="rgba(30,40,103,.3)" strokeWidth="1.2" strokeDasharray="3 5" />

      {/* ── vault: Bailey at the close desk ── */}
      {/* safe */}
      <rect x="220" y="510" width="92" height="78" rx="6" fill="#fffdf6" stroke="#1e2867" strokeWidth="2" />
      <circle cx="266" cy="549" r="17" fill="none" stroke="#1e2867" strokeWidth="2" />
      <circle cx="266" cy="549" r="4" fill="#ef5b36" />
      <line x1="266" y1="532" x2="266" y2="540" stroke="#1e2867" strokeWidth="1.6" />
      {/* coin path into the vault desk */}
      <path id="vaultpath" d="M 600 432 Q 640 470 560 520" fill="none" stroke="none" />
      <circle r="6" fill="#ef5b36" stroke="#d74e2b" strokeWidth="1.5">
        <animateMotion dur="3.6s" begin="1s" repeatCount="indefinite">
          <mpath href="#vaultpath" />
        </animateMotion>
      </circle>
      {/* statement paper */}
      <rect x="540" y="520" width="120" height="64" rx="3" fill="#ffffff" stroke="#1e2867" strokeWidth="1.6" />
      {[534, 544, 554].map(y => (
        <line key={y} x1="552" y1={y} x2="648" y2={y} stroke="rgba(30,40,103,.4)" strokeWidth="1.1" />
      ))}
      <g className="seal">
        <circle cx="628" cy="566" r="12" fill="none" stroke="#ef5b36" strokeWidth="2" />
        <path d="M 622 566 l 4 4 l 8 -9" fill="none" stroke="#ef5b36" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* stamp arm */}
      <g className="stamp-arm">
        <rect x="512" y="500" width="10" height="26" rx="3" fill="#1e2867" />
        <rect x="502" y="522" width="30" height="10" rx="3" fill="#1e2867" />
      </g>
      {/* Bailey character — the logo made flesh */}
      <rect x="700" y="500" width="64" height="84" rx="14" fill="#1e2867" />
      <text x="726" y="558" fontFamily="Fraunces, serif" fontWeight="900" fontSize="44" fill="#f6f3ea">B</text>
      <circle cx="748" cy="566" r="15" fill="#ef5b36" stroke="#fffdf6" strokeWidth="2.5" />
      <text x="732" y="496" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#5c608a" textAnchor="middle">bailey-banker</text>
      {/* desk under bailey/stamp */}
      <line x1="490" y1="588" x2="680" y2="588" stroke="#1e2867" strokeWidth="2" />
    </svg>
  )
}
