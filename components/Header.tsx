'use client';

import React from 'react';
import { MessageSquare, Settings, Database, Sparkles, ShieldCheck, Zap, QrCode, Smartphone } from 'lucide-react';
import { LinkedDeviceState } from '@/lib/wa-device';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenLinkDevice: () => void;
  isApiConfigured: boolean;
  deviceState: LinkedDeviceState;
  totalSentCount: number;
}

export default function Header({
  onOpenSettings,
  onOpenLinkDevice,
  isApiConfigured,
  deviceState,
  totalSentCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
          <MessageSquare className="w-6 h-6 fill-current" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">WhatsApp Blast</h1>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-brand-50 text-brand-700 border border-brand-200">
              {deviceState.isConnected ? '📱 Linked Device' : 'Meta API Ready'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Enterprise Marketing &amp; Direct Phone Dispatcher</p>
        </div>
      </div>

      {/* Connection Buttons */}
      <div className="flex items-center space-x-3">
        {/* Supabase Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Supabase DB Connected</span>
        </div>

        {/* Counter */}
        <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Sent: <strong>{totalSentCount}</strong></span>
        </div>

        {/* 1. Link Device Button (QR Code Scan) */}
        <button
          onClick={onOpenLinkDevice}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs border ${
            deviceState.isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20'
          }`}
        >
          {deviceState.isConnected ? (
            <>
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>📱 Linked: +{deviceState.phoneNumber || '919876543210'}</span>
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4" />
              <span>Link Device (Scan QR)</span>
            </>
          )}
        </button>

        {/* 2. Meta Cloud API Settings Button */}
        <button
          onClick={onOpenSettings}
          className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition flex items-center space-x-1.5"
          title="Meta Cloud API Settings"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Meta API</span>
        </button>
      </div>
    </header>
  );
}
