import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (!process.env.TINYPESA_API_KEY) {
      return res.status(500).json({ success: false, message: 'TINYPESA_API_KEY missing in Vercel - add to Preview env' })
    }

    const { phone, amount } = req.body
    if (!phone || !amount) return res.status(400).json({ success: false, message: 'phone missing' })

    let raw = phone.toString().replace(/[^0-9]/g,'')
    let msisdn = raw.startsWith('0') ? '254'+raw.slice(1) : raw.startsWith('7') ? '254'+raw : raw

    const resp = await fetch('https://tinypesa.com/api/v1/express/initialize',{
      method:'POST',
      headers:{'Content-Type':'application/json','Apikey':process.env.TINYPESA_API_KEY as string},
      body:JSON.stringify({ amount:Number(amount), msisdn, account_no:'TXN'+Date.now() })
    })

    const data = await resp.json()
    console.log('TinyPesa RAW:', data)

    if (!resp.ok) return res.status(200).json({ success: false, message: data.message || 'TinyPesa failed', data })

    return res.status(200).json({ success: true, data })

  } catch (e:any) {
    console.error('STK CRASH:', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
}
