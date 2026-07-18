import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (!process.env.TINYPESA_API_KEY) {
      return res.status(500).json({ success: false, message: 'TINYPESA_API_KEY missing' })
    }

    const { phone, amount } = req.body
    let raw = phone.toString().replace(/[^0-9]/g,'')
    let msisdn = raw.startsWith('0') ? raw : raw.startsWith('7') ? '0'+raw : raw
    // TinyPesa waxay jeceshahay 07... sida example-ka, ee ma ahan 254...
    if (msisdn.startsWith('254')) msisdn = '0' + msisdn.slice(3)

    const params = new URLSearchParams()
    params.append('amount', String(amount))
    params.append('msisdn', msisdn)
    params.append('account_no', 'TXN'+Date.now())

    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: params.toString()
    })

    const text = await response.text()
    console.log('TinyPesa RAW:', text)

    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text.slice(0,500) } }

    if (!response.ok) {
      return res.status(200).json({ success: false, message: 'TinyPesa error', data })
    }

    return res.status(200).json({ success: true, message: 'STK waa la diray', data })

  } catch (e:any) {
    console.error('STK CRASH:', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
}
