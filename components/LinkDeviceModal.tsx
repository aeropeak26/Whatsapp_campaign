'use client';

import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, RefreshCw, Unlink, KeyRound, Copy, Check, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import { WASessionStatus } from '@/lib/types';

interface LinkDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionStatus: WASessionStatus;
  onStatusChange: (status: WASessionStatus) => void;
}

export default function LinkDeviceModal({ isOpen, onClose, sessionStatus, onStatusChange }: LinkDeviceModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('91');
  const [isLoading, setIsLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | undefined>(sessionStatus.pairingCode);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(sessionStatus.qrCodeUrl);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'qr'>('code');

  if (!isOpen) return null;

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = phoneNumber.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setErrorMsg('Please enter a full phone number with country code (e.g. 919876543210).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/wa-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_pairing_code', phoneNumber: clean }),
      });
      const data = await res.json();

      if (data.success && data.pairingCode) {
        setPairingCode(data.pairingCode);
        if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);

        onStatusChange({
          ...sessionStatus,
          status: 'pairing',
          pairingCode: data.pairingCode,
          qrCodeUrl: data.qrCodeUrl,
          phoneNumber: clean,
          isConnected: false,
        });
      } else {
        setErrorMsg(data.error || 'Failed to request pairing code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating pairing code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode.replace('-', ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirmConnected = async () => {
    setIsLoading(true);
    try {
      const clean = phoneNumber.replace(/\D/g, '') || '919876543210';
      const res = await fetch('/api/wa-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_connected', phoneNumber: clean }),
      });
      const data = await res.json();
      if (data.status) {
        onStatusChange(data.status);
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
      if (data.status) {
        onStatusChange(data.status);
        setPairingCode(undefined);
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
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Link WhatsApp Phone Number</h3>
              <p className="text-xs text-slate-500">Connect via 8-Digit Pairing Code or QR Code</p>
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
        {sessionStatus.isConnected ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">WhatsApp Phone Linked &amp; Active!</h4>
              <p className="text-sm text-emerald-800 font-mono font-bold mt-1">
                +{sessionStatus.phoneNumber || phoneNumber || '919876543210'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Ready for real-time dispatches &amp; incoming replies</p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center space-x-1.5 shadow-2xs"
              >
                <Unlink className="w-4 h-4" />
                <span>Unlink Number</span>
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
          /* Pairing View */
          <div className="space-y-4">
            {/* Mode Tabs: 8-Digit Code vs QR Code */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  activeTab === 'code'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>8-Digit Code (Recommended)</span>
              </button>

              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 ${
                  activeTab === 'qr'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Scan</span>
              </button>
            </div>

            {/* Mode 1: 8-Digit Pairing Code Method */}
            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-brand-600" />
                    <span>Instructions for 8-Digit Code:</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium leading-relaxed">
                    <li>Enter your **WhatsApp Phone Number** below with country code.</li>
                    <li>Open WhatsApp on phone ➔ **Linked Devices** ➔ **Link a Device**.</li>
                    <li>Tap **&quot;Link with phone number instead&quot;** and enter the code below!</li>
                  </ol>
                </div>

                <form onSubmit={handleRequestPairingCode} className="space-y-3">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp Phone Number (with Country Code)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 919876543210"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 shrink-0"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>Get Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {pairingCode && (
                  <div className="bg-gradient-to-tr from-brand-50 via-emerald-50 to-teal-50 p-5 rounded-2xl border border-brand-200 text-center space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Your 8-Digit Pairing Code:</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-brand-700 font-bold rounded-lg border border-brand-200 transition flex items-center space-x-1 text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="py-3 bg-white rounded-2xl border border-brand-300 font-mono text-3xl font-extrabold tracking-widest text-slate-900 shadow-md">
                      {pairingCode}
                    </div>

                    <button
                      onClick={handleConfirmConnected}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Entered Code in WhatsApp? Confirm Connected</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: QR Code Scan Method */}
            {activeTab === 'qr' && (
              <div className="space-y-4 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium">
                  Point your phone camera at the QR code in WhatsApp (*Linked Devices ➔ Link a Device*).
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-100/70 border border-slate-200 rounded-3xl space-y-3">
                  {qrCodeUrl ? (
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
                      <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-52 h-52 object-contain" />
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestPairingCode}
                      className="px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Generate QR Code
                    </button>
                  )}
                </div>

                <button
                  onClick={handleConfirmConnected}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Scanned Code? Confirm Connected</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
