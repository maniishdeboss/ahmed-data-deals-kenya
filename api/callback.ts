import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // TinyPesa waxay xogta ku soo dirtaa qaab POST ah markay lacagtu guulaysato
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Amount, Msisdn } = req.body; // TinyPesa xogta ay soo dhiibto

    // 1. Hubi xirmada uu qofku iibsaday iyadoo loo eegayo lacagta (Amount)
    let dataBundle = "";
    if (Amount === 50) dataBundle = "1GB";
    else if (Amount === 100) dataBundle = "2.5GB";
    else if (Amount === 500) dataBundle = "10GB"; // Tusaale 10GB ah

    if (!dataBundle) {
      return res.status(400).json({ message: "Lacagtan xirmo uma u dhigma" });
    }

    // 2. Kici Africa's Talking Data API si toos ah
    const atResponse = await fetch('https://bundles.africastalking.com/v1/data/send', {
      method: 'POST',
      headers: {
        'apiKey': process.env.AT_API_KEY || '', // Africa's Talking API Key
        'username': process.env.AT_USERNAME || '', // Africa's Talking Username
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: process.env.AT_USERNAME,
        productName: "AhmedDataDeals", // Magaca nidaamkaaga Africa's Talking ku dhex jira
        recipients: [
          {
            phoneNumber: `+${Msisdn}`, // Lambarkii lacagta bixiyey (e.g. +254725...)
            quantity: Amount === 500 ? 10 : 1, // Immisa GB ama MB (ku xidh shuruucda AT)
            unit: "GB"
          }
        ]
      })
    });

    const atResult = await atResponse.json();
    
    return res.status(200).json({ success: true, message: "Data sent via Africa's Talking" });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
