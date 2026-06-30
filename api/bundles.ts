import type { VercelRequest, VercelResponse } from '@vercel/node'

async function getToken() {
  const key = process.env.STATUM_CONSUMER_KEY!
  const secret = process.env.STATUM_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString('base64')
  const r = await fetch('https://api.statum.co.ke/oauth/token', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  })
  const j = await r.json()
  return j.access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = await getToken()
  // isku day endpoints-ka caadiga ah
  const tries = [
    'https://api.statum.co.ke/api/v2/bundles',
    'https://api.statum.co.ke/api/v2/products',
    'https://api.statum.co.ke/api/v2/data',
    'https://api.statum.co.ke/api/v1/data/bundles'
  ]
  for (const url of tries) {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }})
    if (r.ok) return res.status(200).json(await r.json())
  }
  return res.status(404).json({ message: 'Bundle endpoint not found – check Statum API Docs' })
}
