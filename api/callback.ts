import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if(req.method === 'OPTIONS') return res.status(200).end()

  try {
    console.log('RAW BODY:', JSON.stringify(req.body))
    console.log('QUERY:', JSON.stringify(req.query))

    // Amount - fix 018 -> 18
    let amountRaw = String(req.body?.amount || req.body?.Amount || req.body?.value || req.query?.amount || "0")
    let amount = parseInt(amountRaw.replace(/\D/g,''), 10) // 018 => 18
    console.log('Parsed Amount:', amount, 'from', amountRaw)

    let phoneRaw = String(req.body?.msisdn || req.body?.phone || req.body?.Phone || "0725722020")
    let digits = phoneRaw.replace(/\D/g,'')
    if(digits.startsWith('0')) digits = '254'+digits.slice(1)
    if(digits.length==9) digits='254'+digits
    let phonePlus = '+'+digits

    // Product name waa 1770 sidaad sheegtay
    const AT_USER = process.env.AT_USERNAME || 'Ahmeddatadeals'
    const AT_KEY = process.env.AT_API_KEY
    const AT_PRODUCT = process.env.AT_PRODUCT_NAME || '1770'

    const bundleMap: any = {
      18: 'Bingwa_250MB_24hr',
      19: 'Bingwa_250MB_24hr',
      50: 'Bingwa_1.25GB',
      99: 'Bingwa_1GB_24hr',
      100: 'Bingwa_2GB_24hr',
    }

    let bundle = bundleMap[amount]
    if(!bundle){
      console.log(`Amount ${amount} not in map, using default 250MB`)
      bundle = 'Bingwa_250MB_24hr' // si Amount unknown uusan u dhicin
    }

    console.log(`Sending ${bundle} to ${phonePlus} via product ${AT_PRODUCT}`)

    if(!AT_KEY){
      console.error('AT_API_KEY missing!')
      return res.status(200).json({ok:true, msg:'payment logged, no AT key'})
    }

    const atRes = await fetch('https://airtime.africastalking.com/mobile/data', {
      method: 'POST',
      headers: { 'apiKey': AT_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        username: AT_USER,
        productName: AT_PRODUCT,
        recipients: [{ phoneNumber: phonePlus, product: bundle, quantity: 1 }]
      })
    })
    const atText = await atRes.text()
    console.log('AT RESPONSE:', atText)

    return res.status(200).json({ok:true, amount, bundle, at: atText})

  } catch(e:any){
    console.error('CRASH:', e.message)
    return res.status(200).json({ok:false, error:e.message})
  }
}
