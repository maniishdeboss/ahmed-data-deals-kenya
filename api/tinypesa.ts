import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
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

    // Nambarka u habee qaabka ay Paykonnect rabto (Haddii uu 0 ku bilowdo ka saar, tusaale: 712345678)
    let cleanPhone = phone.toString().replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone.slice(3)
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1)
    }

    // Macluumaadka tijaabada (Sandbox Credentials) ee sawirkaaga ku dhex jira
    const agentid = '101'
    const agentpwd = 'demo123'
    const transid = 'TXN' + Date.now() // Samey nambar transaction oo kala duwan markasta
    
    // U diyaarinta url parameters sidii shaxda Parameters ku qorneyd
    const params = new URLSearchParams({
      agentid: agentid,
      transid: transid,
      retailerid: agentid,
      operatorcode: '1',    // 1 = Safaricom (Hubi buugga haddii uu ka duwan yahay)
      circode: '1',         // Circle code (Default: 1)
      product: 'RV',        // Product code (Default: RV)
      denomination: String(amount),
      recharge: String(amount),
      deviceno: cleanPhone,
      mobileno: cleanPhone,
      bulkqty: '1',
      narration: 'Ahmed Data Deals Sale',
      agentpwd: agentpwd,
      loginstatus: 'LIVE',
      appver: '1.0'
    })

    // U dirista dalabka Paykonnect Sandbox API
    const response = await fetch(`https://paykonnect.co.ke{params.toString()}`, {
      method: 'POST'
    })

    const responseText = await response.text()
    console.log("Paykonnect Response:", responseText)

    // Ku keydi xogta transaction-ka gudaha Supabase
    await supabase.from('data_transactions').insert([{
      phone: cleanPhone,
      amount: Number(amount),
      status: responseText.includes('SUCCESS') ? 'success' : 'failed',
      transaction_id: transid
    }])

    return res.status(200).json({
      success: true,
      message: 'Dalabka waa la gudbiyay nidaamka Paykonnect',
      paykonnect_raw: responseText
    })

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
