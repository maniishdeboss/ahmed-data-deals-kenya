import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('TINYPESA WEBHOOK:', JSON.stringify(req.body))

    const amount = Number(req.body?.amount || req.body?.Amount || 0)
    const phone = (req.body?.msisdn || req.body?.phone || '').toString()

    // Amount → Bundle map
    const bundleMap: any = {
      18: '250MB',
      50: '1.25GB',
      52: '350MB',
      95: '1GB',
      100: '2GB',
      250: '2.5GB_3days',
      300: '2.5GB_7days',
      690: '6GB',
      990: '10GB'
    }

    const bundle = bundleMap[amount] || `KES_${amount}`

    // HALKAN KA WAC AFRICA TALKING - tusaale
    // Haddii AT credentials Vercel ku jirto:
    if (process.env.AT_API_KEY && phone) {
      await fetch('https://airtime.africastalking.com/mobile/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': process.env.AT_API_KEY
        },
        body: JSON.stringify({
          username: process.env.AT_USERNAME,
          productName: process.env.AT_PRODUCT,
          recipients: [{ phoneNumber: phone, quantity: bundle }]
        })
      })
    }

    // MAR WALBA 200 soo celi si TinyPesa uusan retry u samayn
    return res.status(200).json({ success: true, received: { amount, phone, bundle } })

  } catch (e: any) {
    console.error('CALLBACK CRASH:', e.message)
    // Xataa haddii crash, 200 soo celi si lacagta customer-ka loo waayin
    return res.status(200).json({ success: false, error: e.message })
  }
}
