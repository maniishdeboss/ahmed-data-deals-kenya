import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    console.log('TINYPESA WEBHOOK RAW:', JSON.stringify(req.body))

    let body = req.body || {}
    // TinyPesa mararka qaarkood x-www-form-urlencoded ayuu soo diraa
    let amount = Number(body.amount || body.Amount || 0)
    let phoneRaw = (body.msisdn || body.phone || body.Phone || '').toString()

    // Phone -> 2547xxxxxxx
    let digits = phoneRaw.replace(/\D/g,'')
    if(digits.startsWith('0')) digits = '254' + digits.slice(1)
    if(digits.length == 9) digits = '254' + digits
    let phone254 = digits
    let phonePlus = '+' + digits // AT wuxuu rabaa +254...

    console.log(`PAYMENT: ${amount} KES from ${phone254}`)

    const AT_KEY = process.env.AT_API_KEY
    const AT_USER = process.env.AT_USERNAME
    const AT_PRODUCT = process.env.AT_PRODUCT_NAME

    if(!AT_KEY ||!AT_USER){
      console.error('MISSING AT ENV VARS')
      return res.status(200).json({ ok:true, msg:'No AT creds, but payment logged', amount, phone: phone254 })
    }

    // MAP amount -> AT bundle name - HALKAN WAX KA BEDEL magacyada AT Dashboard-kaaga
    const bundleMap: any = {
      18: 'Safaricom_Bingwa_250MB_24HRS',
      50: 'Safaricom_Bingwa_1.25GB_Till_Midnight',
      52: 'Safaricom_Bingwa_350MB_7Days',
      95: 'Safaricom_Bingwa_1GB_24HRS',
      100: 'Safaricom_Bingwa_2GB_1Day',
      250: 'Safaricom_Bingwa_2.5GB_3Days',
      300: 'Safaricom_Bingwa_2.5GB_7Days',
      690: 'Safaricom_Bingwa_6GB_7Days',
      990: 'Safaricom_Bingwa_10GB_30Days'
    }

    const bundleName = bundleMap[amount]
    if(!bundleName){
      console.error('Amount aan map lahayn:', amount)
      return res.status(200).json({ ok:true, msg:'Amount unknown' })
    }

    // AFRICA TALKING DATA CALL
    const atPayload = {
      username: AT_USER,
      productName: AT_PRODUCT,
      recipients: [{ phoneNumber: phonePlus, product: bundleName, quantity: 1 }]
    }

    console.log('AT REQUEST:', JSON.stringify(atPayload))

    const atRes = await fetch('https://airtime.africastalking.com/mobile/data', {
      method: 'POST',
      headers: {
        'apiKey': AT_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(atPayload)
    })

    const atText = await atRes.text()
    console.log('AT RESPONSE:', atText)

    return res.status(200).json({ success:true, atResponse: atText })

  } catch(e:any){
    console.error('CALLBACK CRASH:', e.message, e.stack)
    return res.status(200).json({ success:false, error:e.message })
  }
}
