import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Waxaan u oggolaanaynaa inuu akhriyo Far-waawayn (STK) iyo Far-yaryar (Direct Link) labadaba
    const amount = req.body.Amount || req.body.amount;
    const msisdn = req.body.Msisdn || req.body.msisdn;

    if (!amount || !msisdn) {
      return res.status(400).json({ error: "Xog dhammaystiran lama helin" });
    }

    // Isku beddel lambarka qaabka Africa's Talking ay rabto (+254...)
    let formattedPhone = msisdn.toString();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // 1. Go'ami xirmada loo dirayo iyadoo loo eegayo lacagta (Amount)
    let packageQuantity = 0; // Immisa GB
    if (Number(amount) === 50) packageQuantity = 1;      // 1GB
    else if (Number(amount) === 100) packageQuantity = 2.5; // 2.5GB
    else if (Number(amount) === 20) packageQuantity = 0.5;  // 500MB (Gacanta ka habee hadday tahay MB)

    // 2. Toos ugu dir Africa's Talking
    const atResponse = await fetch('https://bundles.africastalking.com/v1/data/send', {
      method: 'POST',
      headers: {
        'apiKey': process.env.AT_API_KEY || '',
        'username': process.env.AT_USERNAME || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: process.env.AT_USERNAME,
        productName: "AhmedDataDeals", 
        recipients: [
          {
            phoneNumber: formattedPhone,
            quantity: packageQuantity,
            unit: "GB" // Haddii ay MB tahay "MB" ka dhig
          }
        ]
      })
    });

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
