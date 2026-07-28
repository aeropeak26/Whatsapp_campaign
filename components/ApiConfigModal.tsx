'use client';

import React, { useState } from 'react';
import { X, Key, PhoneCall, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, HelpCircle, Database } from 'lucide-react';
import { WhatsAppConfig } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onSave: (config: WhatsAppConfig) => void;
}

export default function ApiConfigModal({ isOpen, onClose, config, onSave }: ApiConfigModalProps) {
  const [phoneNumberId, setPhoneNumberId] = useState(config.phoneNumberId || '');
  const [accessToken, setAccessToken] = useState(config.accessToken || '');
  const [apiVersion, setApiVersion] = useState(config.apiVersion || 'v19.0');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/verify-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId, accessToken, apiVersion }),
      });

      const data = await res.json();
      if (data.valid) {
        setTestResult({
          success: true,
          message: `Connected successfully! Phone: ${data.displayPhone || 'WhatsApp Business Number'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with WhatsApp Cloud API.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error testing connection.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig = { phoneNumberId, accessToken, apiVersion };

    // Save to Supabase DB settings table if available
    try {
      if (supabase) {
        await supabase.from('settings').upsert({
          id: 'default',
          phone_number_id: phoneNumberId,
          access_token: accessToken,
          api_version: apiVersion,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn('Supabase settings upsert skipped:', dbErr);
    }

    onSave(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-gray-700 bg-gray-900/90 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">WhatsApp Business API Settings</h3>
              <p className="text-xs text-gray-400">Connect your Meta Developer Cloud API credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Phone Number ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <PhoneCall className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 104857692348501"
                className="w-full pl-10 pr-3 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Found in Meta Developer Portal &gt; WhatsApp &gt; API Setup</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              System Access Token (Permanent / Temporary) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAG..."
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Graph API Version
            </label>
            <select
              value={apiVersion}
              onChange={(e) => setApiVersion(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="v19.0">v19.0 (Latest Standard)</option>
              <option value="v18.0">v18.0</option>
              <option value="v20.0">v20.0 (Beta)</option>
            </select>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 border ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Quick Info link */}
          <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-brand-400" />
              <span>Need help getting your Access Token & Phone ID?</span>
            </div>
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 flex items-center space-x-1 underline shrink-0 ml-2"
            >
              <span>Guide</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !phoneNumberId || !accessToken}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition flex items-center space-x-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Test Connection</span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
