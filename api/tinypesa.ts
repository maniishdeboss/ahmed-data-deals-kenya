// Tusaale koodhka API-ga
export default async function handler(req, res) {
  // Oggolow CORS si aadan u helin 405 error
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, amount } = req.body;
    
    // Halkan geli logic-gaaga TinyPesa (API Key & Merchant ID)
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': 'YOUR_TINYPESA_API_KEY', // Hubi inuu sax yahay
        'MerchantID': 'YOUR_MERCHANT_ID'    // Hubi inuu sax yahay
      },
      body: JSON.stringify({ amount: amount, msisdn: phone })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
    
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
