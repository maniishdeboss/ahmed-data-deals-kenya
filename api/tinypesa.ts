import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount are required' });
    }

    const apiKey = process.env.TINYPEA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'TinyPesa API Key is missing in Vercel settings.' });
    }

    const url = 'https://tinypesa.com/api/v1/express/initialize';

    // U diyaari xogta qaabka TinyPesa
    const formData = new URLSearchParams();
    formData.append('amount', amount.toString());
    formData.append('msisdn', phone); // Lambarka macmiilka ee laga qaadayo lacagta
    formData.append('account_no', '254725722020'); // Lambarkaaga lacagtu ku soo dhacayso/lagu aqoonsanayo

    const tinyPesaResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'ApiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await tinyPesaResponse.json();

    if (tinyPesaResponse.ok && (data.success === true || data.success === 1)) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'TinyPesa integration error' });
    }

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
