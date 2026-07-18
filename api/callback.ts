import type { VercelRequest, VercelResponse } from '@vercel/node'
import africastalking from 'africastalking'

// Africa Talking - kaliya 2-da env ee aad Vercel ku haysato ayuu isticmaalaa
const at = africastalking({
  apiKey: process.env.AT_API_KEY as string,
  username: process.env.AT_USERNAME as string,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Xogta ka timid TinyPesa
    const amount = Number(req.body.amount || req.body.Amount)
    const msisdn = req.body.msisdn || req.body.Msisdn || req.body.phone

    if (!amount ||!msisdn) {
      return res.status(400).json({ success: false, message: 'amount ama phone maqan' })
    }

    // Nambarka sax 254...
    let phone = msisdn.toString().replace(/[^0-9]/g, '')
    if (phone.startsWith('0')) phone = '254' + phone.slice(1)
    else if (phone.startsWith('7')) phone = '254' + phone

    // Amount-ka u beddel MB - halkan ku hagaaji bundle-yada
    const BUNDLE_MAP: Record<number, number> = {
      18: 250,
      50: 1250,
      52: 350
    }

    const quantity = BUNDLE_MAP[amount]
    if (!quantity) {
      return res.status(200).json({ message: 'Amount-kan bundle looma hayo' })
    }

    // Dir Africa's Talking DATA
    const data = at.DATA
    const result = await data.send({
