import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { phone, amount } = req.body || {};
    const apiKey = process.env.TINYPESA_API_KEY;

    // Halkan waxaan u dhisaynaa sidii ay TinyPesa rabtay oo ah Form caadi ah
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'ApiKey': apiKey || '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: amount?.toString(),
        msisdn: phone?.toString(),
        account_no: '254725722020'
      }).toString()
    });

    const text = await response.text();
    return res.status(response.status).send(text);

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
