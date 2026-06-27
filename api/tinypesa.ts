import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers si loogu oggolaado foomka inuu si xor ah u waco API-ga
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Haddii browser-ku soo diro OPTIONS (Tubaaleyn amni), si toos ah ugu jawaab OK
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount are required' });
    }

    const apiKey = process.env.TINYPESA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'TinyPesa API Key is missing in Vercel settings.' });
    }

    const url = 'https://tinypesa.com/api/v1/express/initialize';

    const formData = new URLSearchParams();
    formData.append('amount', amount.toString());
    formData.append('msisdn', phone);
    formData.append('account_no', '254725722020'); 

    const tinyPesaResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'ApiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const textData = await tinyPesaResponse.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (e) {
      return res.status(502).json({ success: false, error: 'TinyPesa unexpected response: ' + textData.substring(0, 100) });
    }

    // Hubi haddii uu guulaystay nidaamka TinyPesa
    if (tinyPesaResponse.ok && (data.success === true || data.success === 1 || data.status === 'success')) {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'TinyPesa integration error' });
    }

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
