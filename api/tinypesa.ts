import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Apikey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ success: false, error: 'Phone and amount are required' });
  }

  let msisdn = phone.trim();
  if (msisdn.startsWith('0')) {
    msisdn = '254' + msisdn.substring(1);
  }

  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': process.env.TINYPESA_API_KEY as string, 
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
    
    if (response.ok && (data.success || data.ResponseCode === '0')) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'Payment initiation failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'TinyPesa connection failed' });
  }
}
