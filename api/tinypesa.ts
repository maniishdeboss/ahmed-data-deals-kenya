  try {
    const response = await fetch('https://tinypesa.com/api/v1/express/initialize', {
      method: 'POST',
      headers: {
        'Apikey': process.env.TINYPESA_API_KEY || '',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // Halkan u beddel sidan si xogtu u noqoto string toos ah
      body: `amount=${amount}&msisdn=${phone}&account_no=AhmedDataDeals`
    });

    const data = await response.json();
    
    // Hubi haddii API-ga uu soo celiyay success ama khalad
    if (data.success || data.ResponseCode === '0') {
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, error: data.message || 'TinyPesa rejected the request' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'TinyPesa connection failed' });
  }
