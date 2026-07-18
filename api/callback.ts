import type { VercelRequest, VercelResponse } from '@vercel/node'
// @ts-ignore
import AfricasTalking from 'africastalking'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin','*')
  if(req.method==='OPTIONS') return res.status(200).end()
  try{
    console.log('RAW:', JSON.stringify(req.body))
    let amountRaw = String(req.body?.amount || req.body?.Amount || req.query?.amount || '0')
    let amount = parseInt(amountRaw.replace(/\D/g,''),10) || 0
    console.log('Parsed Amount:', amount)

    let phoneRaw = String(req.body?.msisdn || req.body?.phone || '0725722020')
    let d = phoneRaw.replace(/\D/g,'')
    if(d.startsWith('0')) d='254'+d.slice(1)
    if(d.length==9) d='254'+d
    let phone = '+'+d
    console.log('Phone:', phone)

    const username = process.env.AT_USERNAME || 'Ahmeddatadeals'
    const apiKey = process.env.AT_API_KEY!
    const productName = process.env.AT_PRODUCT_NAME || 'mobiledata'

    if(!apiKey) throw new Error('AT_API_KEY missing')

    const at = AfricasTalking({ apiKey, username })
    const mobiledata = at.MOBILE_DATA

    // Map amount -> bundle (Safaricom pricing)
    const map: any = {
      18: { quantity: 250, unit: 'MB', validity: 'Day' }, // 250MB 24hr
      19: { quantity: 250, unit: 'MB', validity: 'Day' },
      50: { quantity: 1.25, unit: 'GB', validity: 'Day' },
      99: { quantity: 1, unit: 'GB', validity: 'Day' },
      100: { quantity: 2, unit: 'GB', validity: 'Day' },
    }
    let bundle = map[amount] || { quantity: 250, unit: 'MB', validity: 'Day' }

    console.log(`Sending ${bundle.quantity}${bundle.unit} to ${phone} via ${productName}`)

    const result = await mobiledata.send({
      productName,
      recipients: [{
        phoneNumber: phone,
        quantity: bundle.quantity,
        unit: bundle.unit,
        validity: bundle.validity
      }]
    })
    console.log('AT SUCCESS:', JSON.stringify(result))
    return res.status(200).json({ ok:true, amount, phone, result })

  }catch(e:any){
    console.error('CRASH:', e.message, e.stack)
    return res.status(200).json({ ok:false, error: e.message })
  }
}
