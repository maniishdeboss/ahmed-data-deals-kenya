import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { phone, amount } = req.body

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone iyo amount waa lama huraan' })
    }

    // Nambarka u beddel 2547XXXXXXXX - TinyPesa sidaas ayuu rabaa
    let raw = phone.toString().replace(/[^0-9]/g, '')
    let cleanPhone = raw
    if (raw.startsWith('0')) cleanPhone = '254' + raw.slice(1)
    else if (raw.startsWith('7')) cleanPhone = '254' + raw
    else if (!raw.startsWith('254')) cleanPhone = '254' + raw

    const transid = 'TXN' + Date.now()

    // TinyPesa REAL STK Push - Kaliya TINYPESA_API_KEY ayaa loo baahan yahay
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({
        amount: Number(amount),
        msisdn: cleanPhone,
        account_no: transid
      })
    })

    const data = await response.json()
    console.log("TinyPesa Response:", data)

    const isSuccess = response.ok

    return res.status(200).json({
      success: isSuccess,
      message: isSuccess ? 'STK waa la diray, telefoonka hubi' : 'STK way fashilantay',
      transaction_id: transid,
      data: data
    })

  } catch (error: any) {
    console.error("Error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
