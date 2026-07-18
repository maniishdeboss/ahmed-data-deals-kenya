import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    let { phone, amount } = req.body

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone iyo amount waa lama huraan' })
    }

    // Nambarka u beddel 2547XXXXXXXX - TinyPesa sidaas ayuu rabaa
    let raw = phone.toString().replace(/[^0-9]/g, '')
    let cleanPhone254 = raw
    if (raw.startsWith('0')) {
      cleanPhone254 = '254' + raw.slice(1)
    } else if (raw.startsWith('7')) {
      cleanPhone254 = '254' + raw
    } else if (!raw.startsWith('254')) {
      cleanPhone254 = '254' + raw
    }
    
    // Short version for DB 7XX
    const cleanPhoneShort = cleanPhone254.slice(3)
    const transid = 'TXN' + Date.now()

    // TinyPesa Real API
    const apiUrl = 'https://tinypesa.com/api/v1/express/initialize'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({
        amount: Number(amount),
        msisdn: cleanPhone254,
        account_no: transid
      })
    })

    const responseText = await response.text()
    let responseData: any = {}
    try { responseData = JSON.parse(responseText) } catch { responseData = { raw: responseText } }
    
    console.log("TinyPesa Response:", responseText)

    const isSuccess = response.ok && (responseData.success === true || responseText.includes('SUCCESS'))

    // Keydinta xogta
    await supabase.from('data_transactions').insert([{
      phone: cleanPhoneShort,
      amount: Number(amount),
      status: isSuccess ? 'pending' : 'failed',
      transaction_id: transid
    }])

    return res.status(200).json({
      success: isSuccess,
      message: isSuccess ? 'STK waa la diray, telefoonkaaga hubi' : 'STK diristu way fashilantay',
      transaction_id: transid,
      tinypesa_raw: responseData
    })

  } catch (error: any) {
    console.error("Error:", error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
