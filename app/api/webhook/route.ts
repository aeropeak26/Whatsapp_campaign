import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET Handler for Meta Webhook verification setup
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'whatsapp_blast_secure_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Meta Webhook Verified Successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST Handler for receiving inbound WhatsApp customer replies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if body is a WhatsApp incoming message payload
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const msg = messages[0];
      const fromPhone = msg.from; // Customer phone number
      const msgBody = msg.text?.body || '[Media/Attachment]';
      const msgId = msg.id;
      const contactName = value?.contacts?.[0]?.profile?.name || 'Customer';

      console.log(`Incoming reply from ${fromPhone} (${contactName}): ${msgBody}`);

      // Save reply to Supabase inbound_replies table
      if (supabase) {
        await supabase.from('inbound_replies').insert([
          {
            phone: fromPhone,
            contact_name: contactName,
            message_body: msgBody,
            whatsapp_message_id: msgId,
            received_at: new Date().toISOString(),
            is_read: false,
          },
        ]);
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
