import { defineChain } from 'viem'

// Arc testnet — chain params verified 2026-07-20 (plan/01-validation.md).
// Addresses live here (config), not inline in code: mainnet beta may land mid-hackathon.
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  blockExplorers: { default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' } },
  testnet: true,
})

export const RPC_URLS: string[] = (process.env.RPC_URLS ?? 'https://rpc.testnet.arc.network')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

export const ADDRESSES = {
  // USDC ERC-20 view (6 decimals). Native gas is the SAME balance at 18 decimals.
  usdcErc20: '0x3600000000000000000000000000000000000000',
  // EIP-7708 system emitter: emits an 18-dec Transfer log for EVERY native USDC movement.
  eip7708Emitter: '0xfffffffffffffffffffffffffffffffffffffffe',
  eurc: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  erc8004Identity: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  erc8183Escrow: '0x0747EEf0706327138c69792bF28Cd525089e4583',
  multicall3From: '0x522fAf9A91c41c443c66765030741e4AaCe147D0',
} as const

// eth_getLogs window: docs cap ~10k blocks per call; 5k is the proven safe chunk.
export const LOG_CHUNK = 5_000n
