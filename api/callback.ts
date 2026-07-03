import type { VercelRequest, VercelResponse } from '@vercel/node'
import africastalking from 'africastalking'

// U diyaari AT client
const at = africastalking({
  apiKey: process.env.AT_API_KEY as string,
  username: process.env.AT_USERNAME as string,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Hubi amniga: Kaliya TinyPesa API (ama server-kaaga) ayaa oggol inuu soo diro POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 2. Log-garee xogta si aan u hubino inay soo gaartay Vercel
    console.log('Xogta ka timid TinyPesa:', JSON.stringify(req.body));

    // 3. Hel xogta: TinyPesa waxay inta badan ku soo dirtaa 'amount' iyo 'msisdn'
    const amount = req.body.amount || req.body.Amount
    const msisdn = req.body.msisdn || req.body.Msisdn || req.body.MSISDN || req.body.phone

    if (!amount || !msisdn) {
      return res.status(400).json({ success: false, message: 'Macluumaad dhiman' })
    }

    // 4. Nambarka u habee 2547...
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    else if (phone.startsWith('7')) phone = '254' + phone

    // 5. Hubi xirmada (Bundle Logic)
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

    // 6. U dir xogta Africa's Talking
    // Xusuusin: Hubi in 'mobiledata' uu yahay magaca saxda ah ee aad AT dashboard-ka ku abuurtay
    const data = at.DATA
    const result = await data.send({
      productName: 'mobiledata',
      phoneNumber: '+' + phone,
      quantity: 1, 
      unit: 'GB' 
    })

    console.log('Africa Talking Response:', result);

    return res.status(200).json({ success: true, result: result })

  } catch (error: any) {
    console.error('AT Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
