import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, amount, account_no } = req.body

  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.TINYPESA_API_KEY as string // Halkan waxaad ka isticmaashaa key-ga aad Vercel ku dartay
      },
      body: JSON.stringify({
        amount: amount,
        msisdn: phone,
        account_no: account_no // Tusaale: 1770
      })
    })

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'STK Push failed' })
  }
}
