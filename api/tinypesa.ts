export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body;
  const apiKey = process.env.TINYPESA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key lama helin gudaha server-ka" });
  }

  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        msisdn: phone,
        account_no: '254725723383'
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
