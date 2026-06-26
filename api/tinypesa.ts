import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, error: 'Phone and amount are missing' });
    }

    const apiKey = process.env.TINYPESA_API_KEY;
    if (!apiKey) {
      console.error("API KEY IS MISSING IN VERCEL SETTINGS");
      return res.status(500).json({ error: "Server configuration error" });
    }

    let msisdn = phone.toString().trim();
    if (msisdn.startsWith('0')) msisdn = '254' + msisdn.substring(1);

    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': apiKey,
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
    console.log("TinyPesa raw response:", data);

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("CRITICAL ERROR:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
