'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, CheckCircle2, XCircle, Clock, Send, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedContact } from './ContactUploader';
import { WhatsAppConfig } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';

import { LinkedDeviceState } from '@/lib/types';

interface CampaignMonitorProps {
  contacts: ParsedContact[];
  messageType: 'text' | 'template';
  messageText: string;
  templateName: string;
  templateLanguage: string;
  templateParams: string[];
  config: WhatsAppConfig;
  deviceState?: LinkedDeviceState;
  onOpenSettings: () => void;
  onOpenLinkDevice: () => void;
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
  deviceState,
  onOpenSettings,
  onOpenLinkDevice,
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
    // Determine connection mode
    const isDeviceActive = Boolean(deviceState?.isConnected);

    if (!isDeviceActive && (!config.phoneNumberId || !config.accessToken)) {
      onOpenLinkDevice();
      return;
    }

    if (validContacts.length === 0) return;

    setIsSending(true);
    setIsPaused(false);
    isSendingRef.current = true;
    isPausedRef.current = false;

    let newCampaignId = campaignId;
    try {
      if (supabase) {
        const { data } = await supabase
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
      console.warn(e);
    }

    for (let i = 0; i < statuses.length; i++) {
      if (!isSendingRef.current) break;

      while (isPausedRef.current) {
        await new Promise((res) => setTimeout(res, 500));
        if (!isSendingRef.current) break;
      }

      const item = statuses[i];
      if (item.status === 'sent') continue;

      setStatuses((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'sending' } : s))
      );

      let textBody = messageText;
      textBody = textBody.replace(/\{name\}/gi, item.name || 'Customer');
      textBody = textBody.replace(/\{phone\}/gi, `+${item.phone}`);

      try {
        let result: any = { success: false };

        if (isDeviceActive) {
          // Send via WhatsApp Linked Device session
          const response = await fetch('/api/wa-device', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send_message',
              recipientPhone: item.phone,
              messageText: textBody,
              campaignId: newCampaignId,
            }),
          });
          result = await response.json();
        } else {
          // Send via Meta WhatsApp Business Cloud API
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
          result = await response.json();
        }

        const timeStr = new Date().toLocaleTimeString();

        if (result.success) {
          setStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: 'sent', messageId: result.messageId || 'sent_device', time: timeStr }
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

      if (i < statuses.length - 1 && delaySeconds > 0) {
        await new Promise((res) => setTimeout(res, delaySeconds * 1000));
      }
    }

    setIsSending(false);
    isSendingRef.current = false;

    if (sentCount > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Execution Monitor</h2>
            <p className="text-xs text-slate-500">Execute bulk dispatch with real-time progress</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isSending ? (
            <button
              onClick={handleStartCampaign}
              disabled={validContacts.length === 0}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Send WhatsApp Messages ({validContacts.length})</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isSending && !isPaused}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl border border-slate-200 transition"
            title="Reset Queue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {statuses.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-brand-600" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Delay Interval */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span>Anti-Spam Delay: <strong>{delaySeconds} second(s)</strong> between dispatches</span>
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

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 flex items-center space-x-1.5">
            {isSending && <Loader2 className="w-3.5 h-3.5 text-brand-600 animate-spin" />}
            <span>Progress: {progressPercent}%</span>
          </span>
          <div className="flex items-center space-x-3">
            <span className="text-emerald-600">Sent: {sentCount}</span>
            <span className="text-rose-600">Failed: {failedCount}</span>
            <span className="text-slate-500">Total: {totalCount}</span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Dispatch Log Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Recipient</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Message ID / Error</th>
                <th className="px-4 py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statuses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                    No contacts in queue. Add phone numbers above to send messages.
                  </td>
                </tr>
              ) : (
                statuses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2 font-mono text-slate-900 font-semibold">
                      +{item.phone}
                      {item.name && <span className="text-slate-500 text-[11px] ml-1">({item.name})</span>}
                    </td>

                    <td className="px-4 py-2">
                      {item.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Pending
                        </span>
                      )}
                      {item.status === 'sending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          Sending
                        </span>
                      )}
                      {item.status === 'sent' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Sent
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                      {item.messageId ? (
                        <span className="text-brand-700 font-semibold">{item.messageId}</span>
                      ) : item.error ? (
                        <span className="text-rose-600">{item.error}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="px-4 py-2 text-right text-slate-400 font-mono text-[11px]">
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
