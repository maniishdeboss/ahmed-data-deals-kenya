import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Isticmaal service_role si aad u qori karto
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    // Halkan ayaad ku kaydinaysaa xogta Statum soo dirtay
    const { data, error } = await supabase
      .from('data_transactions')
      .insert([{
        phone: body.phone,
        amount: body.amount,
        status: body.status,
        transaction_id: body.id,
        created_at: new Date()
      }])

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
