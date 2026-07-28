import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, cleanPhoneNumber } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientPhone, messageType, textBody, templateName, templateParams, config, campaignId } = body;

    if (!recipientPhone) {
      return NextResponse.json({ success: false, error: 'Recipient phone number is required.' }, { status: 400 });
    }

    if (!config || !config.phoneNumberId || !config.accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'WhatsApp Business API configuration (Phone Number ID & Access Token) missing.' 
      }, { status: 400 });
    }

    const result = await sendWhatsAppMessage({
      recipientPhone,
      messageType: messageType || 'text',
      textBody,
      templateName,
      templateParams,
      config
    });

    // Try logging into Supabase asynchronously if Supabase is connected
    try {
      if (supabase) {
        await supabase.from('logs').insert([{
          campaign_id: campaignId || null,
          phone: cleanPhoneNumber(recipientPhone),
          status: result.success ? 'sent' : 'failed',
          message_id: result.messageId || null,
          error: result.error || null,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (dbErr) {
      console.warn('Supabase log insert skipped/failed:', dbErr);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
