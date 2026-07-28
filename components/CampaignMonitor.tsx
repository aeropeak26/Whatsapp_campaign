'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, CheckCircle2, XCircle, Clock, AlertTriangle, Send, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedContact } from './ContactUploader';
import { WhatsAppConfig } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

interface CampaignMonitorProps {
  contacts: ParsedContact[];
  messageType: 'text' | 'template';
  messageText: string;
  templateName: string;
  templateLanguage: string;
  templateParams: string[];
  config: WhatsAppConfig;
  onOpenSettings: () => void;
  onIncrementTotalSent: () => void;
}

export interface SendingStatus {
  phone: string;
  name?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
  messageId?: string;
  time?: string;
}

export default function CampaignMonitor({
  contacts,
  messageType,
  messageText,
  templateName,
  templateLanguage,
  templateParams,
  config,
  onOpenSettings,
  onIncrementTotalSent,
}: CampaignMonitorProps) {
  const validContacts = contacts.filter((c) => c.isValid);

  const [statuses, setStatuses] = useState<SendingStatus[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState<number>(2);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const isSendingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Sync contacts to statuses when target contacts change
  useEffect(() => {
    if (!isSending) {
      setStatuses(
        validContacts.map((c) => ({
          phone: c.phone,
          name: c.name,
          status: 'pending',
        }))
      );
    }
  }, [contacts]);

  const sentCount = statuses.filter((s) => s.status === 'sent').length;
  const failedCount = statuses.filter((s) => s.status === 'failed').length;
  const totalCount = statuses.length;
  const progressPercent = totalCount > 0 ? Math.round(((sentCount + failedCount) / totalCount) * 100) : 0;

  const handleStartCampaign = async () => {
    if (!config.phoneNumberId || !config.accessToken) {
      onOpenSettings();
      return;
    }

    if (validContacts.length === 0) return;

    setIsSending(true);
    setIsPaused(false);
    isSendingRef.current = true;
    isPausedRef.current = false;

    // Create campaign record in Supabase DB if available
    let newCampaignId = campaignId;
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([
            {
              name: `Blast - ${new Date().toLocaleString()}`,
              default_message: messageText || templateName,
              total_contacts: validContacts.length,
              sent_count: 0,
              failed_count: 0,
              status: 'running',
            },
          ])
          .select()
          .single();

        if (data?.id) {
          newCampaignId = data.id;
          setCampaignId(data.id);
        }
      }
    } catch (e) {
      console.warn('Supabase campaign insert skipped:', e);
    }

    // Execute sequential message dispatch loop
    for (let i = 0; i < statuses.length; i++) {
      if (!isSendingRef.current) break;

      while (isPausedRef.current) {
        await new Promise((res) => setTimeout(res, 500));
        if (!isSendingRef.current) break;
      }

      const item = statuses[i];
      if (item.status === 'sent') continue;

      // Mark current item as sending
      setStatuses((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'sending' } : s))
      );

      // Prepare text body with parameters if present
      let textBody = messageText;
      if (item.name) {
        textBody = textBody.replace(/\{name\}/gi, item.name);
      } else {
        textBody = textBody.replace(/\{name\}/gi, 'Customer');
      }
      textBody = textBody.replace(/\{phone\}/gi, `+${item.phone}`);

      try {
        const response = await fetch('/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientPhone: item.phone,
            messageType,
            textBody,
            templateName,
            templateLanguage,
            templateParams,
            config,
            campaignId: newCampaignId,
          }),
        });

        const result = await response.json();

        const timeStr = new Date().toLocaleTimeString();

        if (result.success) {
          setStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: 'sent', messageId: result.messageId, time: timeStr }
                : s
            )
          );
          onIncrementTotalSent();
        } else {
          setStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: 'failed', error: result.error || 'Failed', time: timeStr }
                : s
            )
          );
        }
      } catch (err: any) {
        setStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'failed', error: err.message, time: new Date().toLocaleTimeString() } : s
          )
        );
      }

      // Delay interval between messages to respect API limits & prevent spam flags
      if (i < statuses.length - 1 && delaySeconds > 0) {
        await new Promise((res) => setTimeout(res, delaySeconds * 1000));
      }
    }

    setIsSending(false);
    isSendingRef.current = false;

    // Trigger confetti celebration if campaign finished with sent items
    if (sentCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    isPausedRef.current = !isPaused;
  };

  const handleReset = () => {
    setIsSending(false);
    setIsPaused(false);
    isSendingRef.current = false;
    isPausedRef.current = false;
    setStatuses(
      validContacts.map((c) => ({
        phone: c.phone,
        name: c.name,
        status: 'pending',
      }))
    );
  };

  const handleExportCSV = () => {
    if (statuses.length === 0) return;
    const header = 'Phone,Name,Status,Message ID,Error,Time\n';
    const rows = statuses
      .map(
        (s) =>
          `"${s.phone}","${s.name || ''}","${s.status}","${s.messageId || ''}","${
            s.error || ''
          }","${s.time || ''}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp_campaign_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Campaign Launcher & Monitor</h2>
            <p className="text-xs text-gray-400">Execute bulk dispatch with real-time tracking</p>
          </div>
        </div>

        {/* Dispatch & Pause Action Buttons */}
        <div className="flex items-center space-x-2">
          {!isSending ? (
            <button
              onClick={handleStartCampaign}
              disabled={validContacts.length === 0}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start WhatsApp Blast ({validContacts.length})</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isSending && !isPaused}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-xl border border-gray-700 transition"
            title="Reset Campaign Queue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {statuses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Delay Interval Settings */}
      <div className="flex items-center justify-between bg-gray-900/70 p-3 rounded-xl border border-gray-800 text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>Anti-Spam Delay Interval: <strong>{delaySeconds} second(s)</strong> between messages</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={delaySeconds}
          onChange={(e) => setDelaySeconds(Number(e.target.value))}
          className="w-32 accent-brand-500 cursor-pointer"
        />
      </div>

      {/* Progress Bar & Counters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-300 flex items-center space-x-1.5">
            {isSending && <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />}
            <span>Progress: {progressPercent}%</span>
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-emerald-400">Sent: {sentCount}</span>
            <span className="text-rose-400">Failed: {failedCount}</span>
            <span className="text-gray-400">Total: {totalCount}</span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Live Dispatch Log Table */}
      <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/60">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-800/80 text-gray-400 font-semibold sticky top-0 uppercase tracking-wider border-b border-gray-700">
              <tr>
                <th className="px-4 py-2.5">Recipient</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Message ID / Error</th>
                <th className="px-4 py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {statuses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">
                    No contacts loaded. Paste recipient numbers above to launch your campaign.
                  </td>
                </tr>
              ) : (
                statuses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-2 font-mono text-gray-200">
                      +{item.phone}
                      {item.name && <span className="text-gray-400 text-[11px] ml-1">({item.name})</span>}
                    </td>

                    <td className="px-4 py-2">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                      {item.status === 'sending' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/40 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Sending</span>
                        </span>
                      )}
                      {item.status === 'sent' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Sent</span>
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-400 max-w-xs truncate font-mono text-[11px]">
                      {item.messageId ? (
                        <span className="text-brand-300">{item.messageId}</span>
                      ) : item.error ? (
                        <span className="text-rose-400">{item.error}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="px-4 py-2 text-right text-gray-500 font-mono text-[11px]">
                      {item.time || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
