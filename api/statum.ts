import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Isticmaal service_role si aad u qori karto
);

export async function POST(req: Request) {
  const body = await req.json();

  // Halkan ayaad ku kaydinaysaa xogta Statum soo dirtay
  const { data, error } = await supabase
    .from('data_transactions')
    .insert([{
      phone: body.phone,
      amount: body.amount,
      status: body.status,
      transaction_id: body.id,
      created_at: new Date()
    }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
