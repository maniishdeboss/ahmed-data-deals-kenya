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

    let cleanPhone = phone.toString().replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('254')) {
      cleanPhone = '0' + cleanPhone.slice(3)
    } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
      cleanPhone = '0' + cleanPhone
    }

    const { data, error } = await supabase
      .from('data_transactions')
      .insert([{
        phone: cleanPhone,
        amount: Number(amount),
        status: 'pending',
        transaction_id: null
      }])
      .select()
      .single()

    if (error) throw error

    let ussdCode = ''
    const numAmount = Number(amount)

    if (numAmount === 50) {
      ussdCode = `*180*5*1*${cleanPhone}*1#`
    } else if (numAmount === 100) {
      ussdCode = `*180*5*2*${cleanPhone}*1#`
    } else if (numAmount === 20) {
      ussdCode = `*180*5*3*${cleanPhone}*1#`
    } else if (numAmount === 49) {
      ussdCode = `*180*5*4*${cleanPhone}*1#`
    }

    if (ussdCode !== '') {
      try {
        // Waxaan isticmaali doonaa 'fetch' oo ku dhex jira Node.js si looga fogaado khaladka axios
        const apiResponse = await fetch('https://sms-gate.app', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk_live_a5a7e8b65051540f5025e19deaa2afc763fd6e7773503621568ea41885e6e8b5',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ussd: ussdCode
          })
        });

        if (!apiResponse.ok) {
          const errText = await apiResponse.text();
          console.error("Cillad ka dhacday SMS Gateway Server-ka:", errText);
        } else {
          console.log(`USSD amarkiisa waa loo diray taleefanka: ${ussdCode}`);
        }
      } catch (apiError: any) {
        console.error("Cillad ka dhacday nidaamka gudbinta:", apiError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Dalabka waa la diwaan geliyay, USSD-giina waa la kiciyay',
      transaction: data
    })

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
