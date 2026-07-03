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
      return res.status(200).json({ success: false, message: 'No data found' })
    }

    // 2. Nambarka u habee 2547...
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    if (phone.startsWith('7')) phone = '254' + phone

    // 3. Bundle map - Halkan u isticmaal 1770 sida aan kawada hadalnay
    const BUNDLE_MAP: Record<number, { product_id: string }> = {
      10: { product_id: '1770' }, // 10 KES
      20: { product_id: '1770' }, // 20 KES
      40: { product_id: '1770' }, // 40 KES
      49: { product_id: '1770' }, // 49 KES
      95: { product_id: '1770' }, // 95 KES
    }

    const paidAmount = Number(amount)
    const bundle = BUNDLE_MAP[paidAmount]

    if (!bundle) {
      return res.status(200).json({ message: 'Xirmadan lama aqoonsan' })
    }

    // 4. U dir xogta Africa's Talking
    const data = at.DATA
    const result = await data.send({
      productName: 'mobiledata', // Hubi inuu magacani yahay kii aad ku samaysatay dashboard-ka
      phoneNumber: phone,
      quantity: 1, // Halkan waxaa laga yaabaa inay u baahan tahay cadad
      // Waxaa laga yaabaa inaad u baahato inaad product_id ku dhex riddo options-ka
    })

    return res.status(200).json({ success: true, data: result })

  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
