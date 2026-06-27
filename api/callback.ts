import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TinyPesa waxay xogta ku soo dirtaa 'amount' iyo 'msisdn' marka link la isticmaalo
    const amount = req.body.amount || req.body.Amount;
    const msisdn = req.body.msisdn || req.body.Msisdn;

    if (!amount || !msisdn) {
      return res.status(200).json({ success: false, message: "No data found" });
    }

    // Habaynta nambarka si uu u noqdo qaabka Africa's Talking (+254...)
    let phone = msisdn.toString().trim();
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    // Go'aami inta GB ama MB ee loo dirayo qofka marka loo eego lacagta uu bixiyey (Price)
    let quantity = 0;
    let unit = "GB";

    const paidAmount = Number(amount);
    if (paidAmount === 50) {
        quantity = 1; // 1GB
    } else if (paidAmount === 100) {
        quantity = 2.5; // 2.5GB
    } else if (paidAmount === 20) {
        quantity = 500; 
        unit = "MB"; // 500MB
    } else if (paidAmount === 49) {
        quantity = 1.2;
    } else {
        // Wixii airtime ah ama xirmo kale gacanta ka habee halkan sxb
        quantity = 0; 
    }

    if (quantity === 0) {
        return res.status(200).json({ message: "Xirmadan lama aqoonsan, badhanka hawada laguma kicin" });
    }

    // Kici Africa's Talking Data API
    const atResponse = await fetch('https://bundles.africastalking.com/v1/data/send', {
      method: 'POST',
      headers: {
        'apiKey': process.env.AT_API_KEY || '',
        'username': process.env.AT_USERNAME || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: process.env.AT_USERNAME,
        productName: "AhmedDataDeals", // Magaca bundle product-kaaga ee AT ku dhex jira
        recipients: [
          {
            phoneNumber: phone,
            quantity: quantity,
            unit: unit
          }
        ]
      })
    });

    const atResult = await atResponse.json();
    return res.status(200).json({ success: true, data: atResult });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
