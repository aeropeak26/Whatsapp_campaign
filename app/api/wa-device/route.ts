import { NextRequest, NextResponse } from 'next/server';
import { getDeviceState, generatePairingQR, setDeviceConnected, setDeviceDisconnected } from '@/lib/wa-device';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET Handler - Check Linked Device connection status and current QR code
 */
export async function GET() {
  const state = getDeviceState();
  return NextResponse.json(state);
}

/**
 * POST Handler - Manage Linked Device QR Code scanning and dispatches
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phoneNumber, recipientPhone, messageText, campaignId } = body;

    if (action === 'generate_qr') {
      const qrUrl = await generatePairingQR();
      return NextResponse.json({
        success: true,
        qrCodeUrl: qrUrl,
        status: 'pairing',
      });
    }

    if (action === 'simulate_connect') {
      const clean = cleanPhoneNumber(phoneNumber || '919876543210');
      const state = setDeviceConnected(clean, 'Jayaprakash (AeroPeak)');
      return NextResponse.json({
        success: true,
        state,
      });
    }

    if (action === 'disconnect') {
      const state = setDeviceDisconnected();
      return NextResponse.json({
        success: true,
        state,
      });
    }

    if (action === 'send_message') {
      const state = getDeviceState();
      if (!state.isConnected) {
        return NextResponse.json({
          success: false,
          error: 'No WhatsApp device linked. Please scan the QR code first.',
        }, { status: 400 });
      }

      const cleanRecipient = cleanPhoneNumber(recipientPhone);
      if (!cleanRecipient) {
        return NextResponse.json({
          success: false,
          error: 'Invalid recipient phone number.',
        }, { status: 400 });
      }

      // Generate a simulated WhatsApp web message ID
      const messageId = `3EB0${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Log dispatch into Supabase if available
      try {
        if (supabase) {
          await supabase.from('logs').insert([{
            campaign_id: campaignId || null,
            phone: cleanRecipient,
            status: 'sent',
            message_id: messageId,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (dbErr) {
        console.warn('Supabase log insert skipped:', dbErr);
      }

      return NextResponse.json({
        success: true,
        messageId,
        sentFrom: state.phoneNumber,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
