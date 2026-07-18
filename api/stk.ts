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
    if (!phone || !amount) return res.status(400).json({ success: false, message: 'phone missing' })

    // TinyPesa docs waxay rabaa 07... ee ma ahan 254...
    let raw = phone.toString().replace(/[^0-9]/g,'')
    let msisdn = raw.startsWith('0') ? raw : raw.startsWith('7') ? '0'+raw : '0'+raw.slice(-9)
    if (msisdn.startsWith('254')) msisdn = '0' + msisdn.slice(3)

    // JSON ayaan u diraynaa si aan uga boodno "Cross-site POST" CSRF-ka
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({
        amount: Number(amount),
        msisdn: msisdn,
        account_no: 'TXN' + Date.now()
      })
    })

    const text = await response.text()
    console.log('TinyPesa RAW:', text)

    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    // Haddii TinyPesa wali HTML soo celiso, waa inay tahay error page
    if (!response.ok) {
      return res.status(200).json({ success: false, message: data.message || 'TinyPesa error', data })
    }

    return res.status(200).json({ success: true, message: 'STK waa la diray', data })

  } catch (e:any) {
    console.error('STK CRASH:', e.message)
    return res.status(500).json({ success: false, message: e.message })
  }
}
