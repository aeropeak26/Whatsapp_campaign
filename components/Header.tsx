'use client';

import React from 'react';
import { MessageSquare, Settings, Database, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  isApiConfigured: boolean;
  apiPhoneDisplay?: string;
  totalSentCount: number;
}

export default function Header({ onOpenSettings, isApiConfigured, apiPhoneDisplay, totalSentCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-800 bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <MessageSquare className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-bg flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-slate-950 fill-current" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">WhatsApp Blast</h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Meta Cloud API
              </span>
            </div>
            <p className="text-xs text-gray-400">Bulk Campaign Manager & Automated Dispatcher</p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Supabase Connected Badge */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Database Connected</span>
          </div>

          {/* Messages Sent Counter */}
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-gray-800/60 border border-gray-700/60 px-3 py-1.5 rounded-lg text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Dispatched: <strong className="text-white font-semibold">{totalSentCount}</strong></span>
          </div>

          {/* API Configuration Status */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isApiConfigured
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            {isApiConfigured ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{apiPhoneDisplay || 'WhatsApp API Connected'}</span>
                <span className="sm:hidden">API Ready</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Configure WhatsApp API</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
