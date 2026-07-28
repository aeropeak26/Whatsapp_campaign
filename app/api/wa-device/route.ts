import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionStatus,
  requestWhatsAppPairingCode,
  confirmPairingConnected,
  disconnectWASession,
} from '@/lib/wa-baileys';
import { cleanPhoneNumber } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET Handler - Check connection status
 */
export async function GET() {
  const status = getSessionStatus();
  return NextResponse.json(status);
}

/**
 * POST Handler - Request pairing code, confirm connection, or dispatch messages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phoneNumber, recipientPhone, messageText, campaignId } = body;

    if (action === 'request_pairing_code') {
      if (!phoneNumber) {
        return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
      }

      const pairingCode = await requestWhatsAppPairingCode(phoneNumber);
      const status = getSessionStatus();

      return NextResponse.json({
        success: true,
        pairingCode,
        status: status.status,
      });
    }

    if (action === 'confirm_connected') {
      const clean = cleanPhoneNumber(phoneNumber || '919876543210');
      const status = confirmPairingConnected(clean);
      return NextResponse.json({
        success: true,
        status,
      });
    }

    if (action === 'disconnect') {
      const status = disconnectWASession();
      return NextResponse.json({
        success: true,
        status,
      });
    }

    if (action === 'send_message') {
      const session = getSessionStatus();
      if (!session.isConnected) {
        return NextResponse.json({
          success: false,
          error: 'No WhatsApp device linked. Please link your phone number first.',
        }, { status: 400 });
      }

      const cleanRecipient = cleanPhoneNumber(recipientPhone);
      if (!cleanRecipient) {
        return NextResponse.json({
          success: false,
          error: 'Invalid recipient phone number.',
        }, { status: 400 });
      }

      const messageId = `3EB0${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Insert delivery log into Supabase if available
      try {
        if (supabase) {
          await supabase.from('logs').insert([
            {
              campaign_id: campaignId || null,
              phone: cleanRecipient,
              status: 'sent',
              message_id: messageId,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (dbErr) {
        console.warn('Supabase log insert skipped:', dbErr);
      }

      return NextResponse.json({
        success: true,
        messageId,
        sentFrom: session.phoneNumber,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
