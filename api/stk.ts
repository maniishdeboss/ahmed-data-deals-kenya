import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (!process.env.TINYPESA_API_KEY) {
      return res.status(500).json({ success: false, message: 'TINYPESA_API_KEY missing in Vercel' })
    }

    const { phone, amount } = req.body
    let raw = phone.toString().replace(/[^0-9]/g,'')
    let msisdn = raw.startsWith('0') ? raw : raw.startsWith('7') ? '0'+raw : '0'+raw.slice(-9)
    if (msisdn.startsWith('254')) msisdn = '0'+msisdn.slice(3)

    const r = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({
        amount: Number(amount),
        msisdn,
        account_no: 'TXN'+Date.now()
      })
    })

    const text = await r.text()
    console.log('TinyPesa RAW:', text)

    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text.slice(0,800) } }

    if (text.includes('<!DOCTYPE') || text.includes('Cross-site')) {
      return res.status(200).json({ success: false, message: 'TinyPesa blocked, check API Key / credits', data })
    }

    return res.status(200).json({ success: true, data })

  } catch (e:any) {
    console.error('STK CRASH:', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
}
