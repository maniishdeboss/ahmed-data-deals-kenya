import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ success: false })

  try {
    const { phone, amount } = req.body
    let raw = phone.toString().replace(/[^0-9]/g, '')
    let msisdn = raw.startsWith('0') ? '254' + raw.slice(1) : raw.startsWith('7') ? '254' + raw : raw
    
    const transid = 'TXN' + Date.now()

    const resp = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': process.env.TINYPESA_API_KEY as string
      },
      body: JSON.stringify({ amount: Number(amount), msisdn, account_no: transid })
    })

    const data = await resp.json()
    console.log("TinyPesa:", data)

    return res.status(200).json({ success: true, transaction_id: transid, data })
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message })
  }
}
