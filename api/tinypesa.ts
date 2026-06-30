import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone, amount, status, id } = req.body;

  try {
    const { error } = await supabase
      .from('data_transactions')
      .insert([{ phone, amount, status, transaction_id: id }]);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Data saved successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
