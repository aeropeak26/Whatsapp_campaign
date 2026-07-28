'use client';

import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle2, RefreshCw, Unlink, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { LinkedDeviceState } from '@/lib/wa-device';

interface LinkDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceState: LinkedDeviceState;
  onStateChange: (state: LinkedDeviceState) => void;
}

export default function LinkDeviceModal({ isOpen, onClose, deviceState, onStateChange }: LinkDeviceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(deviceState.qrCodeUrl);
  const [phoneInput, setPhoneInput] = useState('919876543210');

  useEffect(() => {
    if (isOpen && !deviceState.isConnected && !qrCodeUrl) {
      handleGenerateQR();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateQR = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wa-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_qr' }),
      });
      const data = await res.json();
      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        onStateChange({
          ...deviceState,
          status: 'pairing',
          qrCodeUrl: data.qrCodeUrl,
          isConnected: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wa-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_connect', phoneNumber: phoneInput }),
      });
      const data = await res.json();
      if (data.state) {
        onStateChange(data.state);
        setQrCodeUrl(undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wa-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      const data = await res.json();
      if (data.state) {
        onStateChange(data.state);
        setQrCodeUrl(undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Link WhatsApp Device</h3>
              <p className="text-xs text-slate-500">Scan QR Code to connect your WhatsApp phone directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status: Device Already Connected */}
        {deviceState.isConnected ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">WhatsApp Device Linked &amp; Connected!</h4>
              <p className="text-xs text-emerald-800 font-mono mt-1">
                Active Phone: +{deviceState.phoneNumber || '919876543210'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                User: <strong>{deviceState.pushName || 'Jayaprakash (AeroPeak)'}</strong>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center space-x-1.5 shadow-2xs"
              >
                <Unlink className="w-4 h-4" />
                <span>Unlink Device</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Status: Pair Device with QR Code */
          <div className="space-y-4">
            {/* Step-by-step Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span>How to connect your phone:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium pl-1 leading-relaxed">
                <li>Open **WhatsApp** or **WhatsApp Business** on your phone.</li>
                <li>Tap **Menu** (⋮) or **Settings** ⚙️ and select **Linked Devices**.</li>
                <li>Tap **Link a Device** and point your camera at this QR code.</li>
              </ol>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100/70 border border-slate-200 rounded-3xl space-y-3">
              {isLoading ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-brand-600" />
                  <p className="text-xs font-semibold">Generating WhatsApp QR Code...</p>
                </div>
              ) : qrCodeUrl ? (
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
                  <img src={qrCodeUrl} alt="WhatsApp Web QR Code" className="w-52 h-52 object-contain" />
                </div>
              ) : (
                <button
                  onClick={handleGenerateQR}
                  className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Generate QR Code
                </button>
              )}

              <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>QR Code refreshes automatically for secure pairing</span>
              </p>
            </div>

            {/* Quick Connect & Pair Confirmation */}
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Scanned QR Code with your phone?</span>
                <button
                  onClick={handleSimulateScan}
                  disabled={isLoading}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <span>Confirm Linked Connection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
