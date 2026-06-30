import type { VercelRequest, VercelResponse } from '@vercel/node'

// --- Statum OAuth ---
async function getStatumToken() {
  const key = process.env.STATUM_CONSUMER_KEY!
  const secret = process.env.STATUM_CONSUMER_SECRET!
  const auth = Buffer.from(`${key}:${secret}`).toString('base64')

  const res = await fetch('https://api.statum.co.ke/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!res.ok) throw new Error('Statum auth failed')
  const data = await res.json()
  return data.access_token as string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // TinyPesa Link waxay soo dirtaa amount / msisdn
    const amount = req.body.amount || req.body.Amount
    const msisdn = req.body.msisdn || req.body.Msisdn || req.body.MSISDN || req.body.phone

    if (!amount || !msisdn) {
      return res.status(200).json({ success: false, message: 'No data found' })
    }

    // Nambarka u habee 2547...
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    if (phone.startsWith('7')) phone = '254' + phone

    // --- Bundle map: halkan ku beddel product_id-ga Statum ee saxda ah ---
    const BUNDLE_MAP: Record<number, { product_id: string }> = {
      20:  { product_id: 'TUNUKIWA_500MB' },  // 500MB Flash
      49:  { product_id: '1_2GB' },           // 1.2GB
      50:  { product_id: '1GB' },             // 1GB
      100: { product_id: '2_5GB' },           // 2.5GB
    }

    const paidAmount = Number(amount)
    const bundle = BUNDLE_MAP[paidAmount]

    if (!bundle) {
      return res.status(200).json({ message: 'Xirmadan lama aqoonsan' })
    }

    // --- Statum buy ---
    const token = await getStatumToken()

    const buyRes = await fetch('https://api.statum.co.ke/api/v1/airtime', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        phone_number: phone,
        // Halkan ku isticmaal field-ka saxda ah ee Statum API Docs-kaaga
        // Tusaale ahaan:
        product_id: bundle.product_id,
        // amount: paidAmount,
      })
    })

    const buyResult = await buyRes.json()

    if (!buyRes.ok) {
      return res.status(500).json({ success: false, error: buyResult })
    }

    return res.status(200).json({ success: true, data: buyResult })

  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
