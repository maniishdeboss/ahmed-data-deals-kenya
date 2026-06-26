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

  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        // Halkan waxaan ku qoray Key-gaaga cusub si aanay u jirin wax isku dhex daldalan
        'Apikey': '950LMleTTFkVXnNqd9S3ReNy6iX1-PmI57WiDEf7ZSsRqpmkBl',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Halkan nambarkaaga rasmiga ah ayuu ku qoran yahay
      body: `amount=${amount}&msisdn=${phone}&account_no=254725723383`
    });

    const data = await response.json();

    if (data.success || data.ResponseCode === '0') {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'Payment initiation failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'TinyPesa connection failed' });
  }
}
