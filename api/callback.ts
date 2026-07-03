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
    // 1. Hel xogta ka timid TinyPesa
    const amount = req.body.amount || req.body.Amount
    const msisdn = req.body.msisdn || req.body.Msisdn || req.body.MSISDN || req.body.phone

    if (!amount || !msisdn) {
      return res.status(400).json({ success: false, message: 'Macluumaad dhiman' })
    }

    // 2. Nambarka u habee 2547...
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    else if (phone.startsWith('7')) phone = '254' + phone

    // 3. Bundle map - Hubi in product_id uu sax yahay
    const BUNDLE_MAP: Record<number, { product_id: string }> = {
      10: { product_id: '1770' },
      20: { product_id: '1770' },
      40: { product_id: '1770' },
      49: { product_id: '1770' },
      95: { product_id: '1770' },
    }

    const paidAmount = Number(amount)
    const bundle = BUNDLE_MAP[paidAmount]

    if (!bundle) {
      return res.status(200).json({ message: 'Xirmadan lama aqoonsan' })
    }

    // 4. U dir xogta Africa's Talking
    const data = at.DATA
    const result = await data.send({
      productName: 'mobiledata', // Magaca aad ugu bixisay dashboard-ka 1000307057.jpg
      phoneNumber: '+' + phone, // Africa's Talking waxay u baahan tahay qaabka +254...
      // quantity waa inuu noqdaa mid ku habboon xirmada aad iibinayso
      quantity: 1, 
      unit: 'GB' 
    })

    return res.status(200).json({ success: true, result: result })

  } catch (error: any) {
    console.error('AT Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
