import type { VercelRequest, VercelResponse } from '@vercel/node'
// @ts-ignore
import AfricasTalking from 'africastalking'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    console.log('=== NEW PAYMENT ===')
    console.log('RAW BODY:', JSON.stringify(req.body))
    console.log('QUERY:', JSON.stringify(req.query))

    // Amount - fix 018 => 18
    let amountRaw = String(req.body?.amount || req.body?.Amount || req.body?.value || req.query?.amount || '0')
    let amount = parseInt(amountRaw.replace(/\D/g, ''), 10) || 0
    console.log('Parsed Amount:', amount, 'from', amountRaw)

    // Phone - 0725722020 => +254725722020
    let phoneRaw = String(req.body?.msisdn || req.body?.phone || req.body?.Phone || req.body?.phoneNumber || '0725722020')
    let digits = phoneRaw.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = '254' + digits.slice(1)
    if (digits.length === 9) digits = '254' + digits
    let phone = '+' + digits
    console.log('Phone:', phone)

    const username = process.env.AT_USERNAME || 'Ahmeddatadeals'
    const apiKey = process.env.AT_API_KEY
    const productName = process.env.AT_PRODUCT_NAME || 'mobiledata'

    console.log('AT Config:', { username, productName, hasKey:!!apiKey })

    if (!apiKey) {
      console.error('AT_API_KEY missing!')
      return res.status(200).json({ ok: false, error: 'AT_API_KEY missing' })
    }

    const at = AfricasTalking({ apiKey, username })
    const mobiledata = at.MOBILE_DATA

    // Map KES to bundle
    const bundleMap: any = {
      18: { quantity: 250, unit: 'MB', validity: 'Day' },
      19: { quantity: 250, unit: 'MB', validity: 'Day' },
      50: { quantity: 1.25, unit: 'GB', validity: 'Day' },
      99: { quantity: 1, unit: 'GB', validity: 'Day' },
      100: { quantity: 2, unit: 'GB', validity: 'Day' },
      199: { quantity: 1, unit: 'GB', validity: 'Week' },
      250: { quantity: 2, unit: 'GB', validity: 'Week' },
    }

    let bundle = bundleMap[amount] || { quantity: 250, unit: 'MB', validity: 'Day' }
    console.log(`Sending ${bundle.quantity}${bundle.unit} ${bundle.validity} to ${phone}`)

    const result = await mobiledata.send({
      productName: productName,
      recipients: [
        {
          phoneNumber: phone,
          quantity: bundle.quantity,
          unit: bundle.unit,
          validity: bundle.validity,
        },
      ],
    })

    console.log('AT SUCCESS:', JSON.stringify(result))

    return res.status(200).json({
      ok: true,
      msg: 'Data sent',
      amount,
      phone,
      bundle,
      at_result: result,
    })

  } catch (e: any) {
    console.error('CRASH:', e.message)
    console.error(e.stack)
    // Weli 200 u celi si TinyPesa uusan retry u sameyn
    return res.status(200).json({ ok: false, error: e.message })
  }
}
