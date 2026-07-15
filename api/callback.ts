import type { VercelRequest, VercelResponse } from '@vercel/node'
import africastalking from 'africastalking'

// U diyaari AT client
const at = africastalking({
  apiKey: process.env.AT_API_KEY as string,
  username: process.env.AT_USERNAME as string,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Xogta ka timid Paykonnect/TinyPesa:', JSON.stringify(req.body));

    // Qaadashada xogta (waxaan u dhex galnay dhowr ikhtiyaar si ay ula shaqeyso nooc kasta oo callback ah)
    const amount = Number(req.body.amount || req.body.Amount || req.body.RECHARGE || 0)
    const msisdn = req.body.msisdn || req.body.Msisdn || req.body.MSISDN || req.body.phone || req.body.deviceno

    if (!amount || !msisdn) {
      return res.status(400).json({ success: false, message: 'Macluumaad dhiman' })
    }

    // Nambarka oo la saxayo (254...)
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    else if (phone.startsWith('7')) phone = '254' + phone

    // Hubinta Xirmada
    const BUNDLE_MAP: Record<number, { product_id: string, quantity: number }> = {
      18: { product_id: '1770', quantity: 250 },
      50: { product_id: '1770', quantity: 1250 },
      52: { product_id: '1770', quantity: 350 },
    }

    const bundle = BUNDLE_MAP[amount]

    if (!bundle) {
      return res.status(200).json({ message: 'Xirmadan lama aqoonsan ama amount-ka ayaa qaldan' })
    }

    // U dirista xogta Africa's Talking
    const data = at.DATA
    const result = await data.send({
      productName: 'mobiledata', // Hubi inuu yahay magacaaga saxda ah ee AT
      phoneNumber: '+' + phone,
      quantity: bundle.quantity, 
      unit: 'MB' 
    })

    console.log('Africa Talking Success:', result);

    return res.status(200).json({ success: true, result: result })

  } catch (error: any) {
    console.error('AT Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
