// OpenRouter caller — model-agnostic via BOOKKEEPER_MODEL env (never UI-selectable).
// Blind per-line calls, temperature 0, strict JSON out.
import { LLM_CATEGORIES, SYSTEM_PROMPT, type LineInput, type Verdict } from './categories.js'
import { sleep } from '../retry.js'

export async function categorizeLine(model: string, apiKey: string, line: LineInput): Promise<Verdict> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(line) },
        ],
      }),
    })
    if (!res.ok) {
      if (res.status === 429 || res.status >= 500) { await sleep(5000 * (attempt + 1)); continue }
      throw new Error(`OpenRouter ${res.status}: ${await res.text()}`)
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const raw = data.choices?.[0]?.message?.content ?? ''
    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    try {
      const v = JSON.parse(jsonText) as Verdict
      if (!LLM_CATEGORIES.includes(v.category)) throw new Error(`invalid category ${v.category}`)
      v.confidence = Math.max(0, Math.min(1, Number(v.confidence)))
      return v
    } catch {
      if (attempt === 2) throw new Error(`unparseable verdict from ${model}: ${raw.slice(0, 200)}`)
      await sleep(2000)
    }
  }
  throw new Error('unreachable')
}
