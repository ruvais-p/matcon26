import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    // 1. Verify the request is authorized (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const testPaymentId = `KEEP_ALIVE_${Date.now()}`;
    const supabaseAdmin = getSupabaseAdmin();

    // 2. Insert a dummy record to keep the DB alive
    const { error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          payment_id: testPaymentId,
          name: "Keep Alive Test",
          email: "keepalive@test.local",
          phone: "0000000000",
          abstract_url: "none",
          food_preference: "veg",
          accommodation_needed: "no",
          status: "pending"
        }
      ]);

    if (insertError) {
      console.error("Keep-alive insert failed:", insertError);
      return NextResponse.json({ success: false, error: 'Insert failed', details: insertError.message }, { status: 500 });
    }

    // 3. Immediately delete the dummy record
    const { error: deleteError } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("payment_id", testPaymentId);

    if (deleteError) {
      console.error("Keep-alive delete failed:", deleteError);
      return NextResponse.json({ success: false, error: 'Delete failed', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Supabase keep-alive ping successful.' });
  } catch (err: any) {
    console.error("Keep-alive error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
