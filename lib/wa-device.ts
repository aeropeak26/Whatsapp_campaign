import QRCode from 'qrcode';

export interface LinkedDeviceState {
  isConnected: boolean;
  phoneNumber?: string;
  pushName?: string;
  qrCodeUrl?: string;
  status: 'disconnected' | 'pairing' | 'connected';
  lastActive?: string;
}

// In-memory global device state store
let globalDeviceState: LinkedDeviceState = {
  isConnected: false,
  status: 'disconnected',
};

export function getDeviceState(): LinkedDeviceState {
  return globalDeviceState;
}

export function updateDeviceState(newState: Partial<LinkedDeviceState>) {
  globalDeviceState = { ...globalDeviceState, ...newState };
  return globalDeviceState;
}

/**
 * Generate a dynamic WhatsApp Web pairing QR Code
 */
export async function generatePairingQR(sessionId: string = 'session_1'): Promise<string> {
  // Simulate standard WhatsApp Web multi-device connection pairing string
  const ref = Math.random().toString(36).substring(2, 12);
  const waAuthPairingStr = `2@${ref},${Date.now()},s9f8u3j4=${Math.random().toString(36).substring(2)}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(waAuthPairingStr, {
      margin: 2,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    updateDeviceState({
      status: 'pairing',
      qrCodeUrl: qrDataUrl,
      isConnected: false,
    });

    return qrDataUrl;
  } catch (err: any) {
    console.error('Failed to generate QR code:', err);
    throw err;
  }
}

/**
 * Confirm device connection after QR code scan
 */
export function setDeviceConnected(phoneNumber: string, pushName: string = 'WhatsApp Business User') {
  return updateDeviceState({
    isConnected: true,
    status: 'connected',
    phoneNumber,
    pushName,
    qrCodeUrl: undefined,
    lastActive: new Date().toISOString(),
  });
}

/**
 * Disconnect linked device session
 */
export function setDeviceDisconnected() {
  return updateDeviceState({
    isConnected: false,
    status: 'disconnected',
    phoneNumber: undefined,
    pushName: undefined,
    qrCodeUrl: undefined,
  });
}
