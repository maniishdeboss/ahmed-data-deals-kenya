import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Apikey');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body;

  // Hubi in nambarka uu yahay 254
  let msisdn = phone.toString().trim();
  if (msisdn.startsWith('0')) msisdn = '254' + msisdn.substring(1);
  if (msisdn.startsWith('7')) msisdn = '254' + msisdn;

  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': process.env.TINYPESA_API_KEY || '', 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        msisdn: msisdn,
        account_no: '254725723383'
      })
    });

    const data = await response.json();
    console.log("TinyPesa Res:", data); // Kani waa meesha aad ka arki karto wixii dhacay

    if (data.success === true || data.ResponseCode === '0') {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'Payment failed' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Connection error' });
  }
}
