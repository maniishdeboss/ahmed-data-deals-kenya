import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS – si frontend-ka Vercel uu ula hadli karo
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
      return res.status(400).json({ success: false, message: 'phone iyo amount waa lagama maarmaan' })
    }

    // Nambarka u habee 2547...
    phone = phone.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    if (phone.startsWith('7')) phone = '254' + phone

    const { data, error } = await supabase
      .from('data_transactions')
      .insert([{ 
        phone, 
        amount: Number(amount), 
        status: 'pending',
        transaction_id: null
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ 
      success: true, 
      message: 'Dalabka waa la diiwaan geliyay',
      transaction: data
    })

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
