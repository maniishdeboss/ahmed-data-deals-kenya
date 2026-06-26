export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body;
  const apiKey = process.env.TINYPESA_API_KEY; // Hubi in magacu sax yahay

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
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
