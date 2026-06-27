export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { phone, amount } = req.body;

    const payload = {
      amount: amount,
      description: "Data Purchase",
      msisdn: phone, // Hubi in nambarku yahay 07xxxxxxx
      account_no: "254725723383" // Nambarkaaga merchant-ka
    };

    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': process.env.TINYPESA_API_KEY // Hubi in Vercel ay ku jirto
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "API Request Failed" });
  }
}
