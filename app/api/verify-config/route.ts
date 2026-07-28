import { NextRequest, NextResponse } from 'next/server';
import { verifyWhatsAppConfig } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();
    const result = await verifyWhatsAppConfig(config);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message || 'Validation failed' }, { status: 500 });
  }
}
