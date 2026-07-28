export interface WASessionStatus {
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'pairing' | 'connected';
  phoneNumber?: string;
  pairingCode?: string;
  qrCodeUrl?: string;
  error?: string;
}

export interface LinkedDeviceState {
  isConnected: boolean;
  phoneNumber?: string;
  pushName?: string;
  qrCodeUrl?: string;
  status: 'disconnected' | 'pairing' | 'connected';
  lastActive?: string;
}
