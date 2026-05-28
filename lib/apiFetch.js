// Shared fetch wrapper: retries once after 2 s on network failure or gateway error (502/503/504).
// Returns parsed JSON. Throws on second failure.
export async function apiFetch(action, params = {}) {
  async function attempt() {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    })
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status })
    }
    return res.json()
  }

  try {
    return await attempt()
  } catch {
    await new Promise((r) => setTimeout(r, 2000))
    return attempt()
  }
}
