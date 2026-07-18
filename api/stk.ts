import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { phone, amount, account_no } = req.body

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone iyo amount waa lama huraan' })
    }

    // 0727 -> 254727 TinyPesa sidaas ayuu rabaa
    let raw = phone.toString().replace(/[^0-9]/g, '')
    let cleanPhone = raw
    if (raw.startsWith('0')) cleanPhone = '254' + raw.slice(1)
    else if (raw.startsWith('7')) cleanPhone = '254' + raw
    else if (!raw.startsWith('254')) cleanPhone = '254' + raw

    const transId = account_no || 'TXN' + Date.now()

    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({
        amount: Number(amount),
        msisdn: cleanPhone,
        account_no: transId
      })
    })

    const text = await response.text()
    let data: any = {}
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    console.log('TinyPesa Response:', text)

    if (!response.ok) {
      return res.status(200).json({ success: false, message: 'TinyPesa error', data })
    }

    return res.status(200).json({
      success: true,
      message: 'STK waa la diray',
      transaction_id: transId,
      data
    })

  } catch (error: any) {
    console.error('STK Error:', error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
