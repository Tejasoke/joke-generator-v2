// In development: Vite proxy forwards /api → localhost:8000
// In production (Vercel): Set VITE_API_BASE_URL to your deployed FastAPI backend (e.g. on Render/HF Spaces)
// If VITE_API_BASE_URL is not set, requests fall back to relative /api (same-origin or vercel.json rewrites)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/**
 * Non-streaming: POST /api/generate
 * Returns: { joke, reaction, style, topic, device }
 */
export async function generateJoke({ topic, style, strictMode, numSequences = 5 }) {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      style,
      strict_mode: strictMode,
      num_sequences: numSequences,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Generation failed')
  }

  return res.json()
}

/**
 * Streaming: POST /api/generate-stream
 * Returns a raw fetch Response — caller reads body.getReader()
 */
export async function generateJokeStream({ topic, style, strictMode }) {
  const res = await fetch(`${API_BASE}/api/generate-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      style,
      strict_mode: strictMode,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Stream failed')
  }

  return res
}

/**
 * GET /api/health
 * Returns: { status, model, device, model_dir }
 */
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`)
  if (!res.ok) {
    throw new Error('Health check failed')
  }
  return res.json()
}
