export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { phone, amount } = req.body;

    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.TINYPESA_API_KEY, 
        'MerchantID': process.env.MERCHANT_ID
      },
      body: JSON.stringify({ amount, msisdn: phone })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Server failed' });
  }
}
