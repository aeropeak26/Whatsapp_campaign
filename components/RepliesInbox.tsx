'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, RefreshCw, Send, CheckCheck, User, Phone, Clock, Sparkles } from 'lucide-react';
import { InboundReply, SendLog, supabase } from '@/lib/supabase';
import { WhatsAppConfig, cleanPhoneNumber } from '@/lib/whatsapp';

interface RepliesInboxProps {
  config: WhatsAppConfig;
}

export default function RepliesInbox({ config }: RepliesInboxProps) {
  const [replies, setReplies] = useState<InboundReply[]>([]);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Sample seed data if Supabase has no replies yet, so UI can be fully explored!
  const defaultSampleReplies: InboundReply[] = [
    {
      id: 'demo-1',
      phone: '15550192834',
      contact_name: 'Alex Morgan',
      message_body: 'Hi! Is the 20% discount code SPECIAL20 still valid for today?',
      received_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      is_read: false,
    },
    {
      id: 'demo-2',
      phone: '919876543210',
      contact_name: 'Rahul Sharma',
      message_body: 'Yes, I would like to confirm my appointment for tomorrow at 10 AM. Thanks!',
      received_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      is_read: true,
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        // Fetch inbound replies
        const { data: replyData } = await supabase
          .from('inbound_replies')
          .select('*')
          .order('received_at', { ascending: false });

        if (replyData && replyData.length > 0) {
          setReplies(replyData);
        } else {
          setReplies(defaultSampleReplies);
        }

        // Fetch sent message logs for contact timeline history
        const { data: logData } = await supabase
          .from('logs')
          .select('*')
          .order('timestamp', { ascending: true });

        if (logData) setLogs(logData);
      } else {
        setReplies(defaultSampleReplies);
      }
    } catch (e) {
      console.warn(e);
      setReplies(defaultSampleReplies);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter contacts by search
  const uniquePhones = Array.from(new Set([...replies.map((r) => r.phone), ...logs.map((l) => l.phone)]));

  const filteredPhones = uniquePhones.filter((phone) => {
    const contactName = replies.find((r) => r.phone === phone)?.contact_name || '';
    return phone.includes(searchQuery) || contactName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activePhone = selectedPhone || filteredPhones[0] || '15550192834';
  const activeContactName = replies.find((r) => r.phone === activePhone)?.contact_name || 'Customer';

  // Build combined chronological chat history for active contact (Sent dispatches + Received replies)
  const conversationTimeline = [
    ...logs
      .filter((l) => cleanPhoneNumber(l.phone) === cleanPhoneNumber(activePhone))
      .map((l) => ({
        id: l.id || `sent-${l.timestamp}`,
        type: 'outbound' as const,
        body: `Campaign Message Sent (${l.status})`,
        time: l.timestamp,
      })),
    ...replies
      .filter((r) => cleanPhoneNumber(r.phone) === cleanPhoneNumber(activePhone))
      .map((r) => ({
        id: r.id || `reply-${r.received_at}`,
        type: 'inbound' as const,
        body: r.message_body,
        time: r.received_at,
      })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Handle direct 1-on-1 reply dispatch
  const handleSendDirectReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activePhone) return;

    setIsSendingReply(true);

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: activePhone,
          messageType: 'text',
          textBody: replyText,
          config,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Append to local log timeline
        setLogs((prev) => [
          ...prev,
          {
            phone: activePhone,
            status: 'sent',
            timestamp: new Date().toISOString(),
            message_id: data.messageId,
          },
        ]);
        setReplyText('');
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[620px]">
      {/* Left Column: Contact Reply List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        {/* List Header */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Customer Replies</h2>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone or name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 transition"
            />
          </div>
        </div>

        {/* Contact Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredPhones.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <p>No customer reply threads found.</p>
            </div>
          ) : (
            filteredPhones.map((phone) => {
              const latestReply = replies.find((r) => r.phone === phone);
              const contactName = latestReply?.contact_name || 'Customer';
              const isSelected = activePhone === phone;

              return (
                <div
                  key={phone}
                  onClick={() => setSelectedPhone(phone)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer transition ${
                    isSelected ? 'bg-brand-50/80 border-l-4 border-brand-500' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {contactName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{contactName}</h4>
                      {latestReply && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(latestReply.received_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate">+{phone}</p>
                    {latestReply && (
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-normal">
                        {latestReply.message_body}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat History & Direct WhatsApp Reply */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {activeContactName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeContactName}</h3>
              <p className="text-xs text-slate-500 font-mono">+{activePhone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">WhatsApp Cloud API Active</span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="wa-chat-bg-light flex-1 p-6 overflow-y-auto space-y-3">
          {conversationTimeline.length === 0 ? (
            <div className="bg-white/90 p-4 rounded-xl shadow-sm text-center text-xs text-slate-500 max-w-sm mx-auto space-y-1">
              <Sparkles className="w-5 h-5 mx-auto text-amber-500" />
              <p className="font-semibold text-slate-700">No message history yet for +{activePhone}</p>
              <p className="text-[11px] text-slate-400">
                Send a campaign blast to start a conversation timeline.
              </p>
            </div>
          ) : (
            conversationTimeline.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col max-w-[75%] ${
                  item.type === 'outbound' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 text-xs leading-relaxed shadow-sm ${
                    item.type === 'outbound'
                      ? 'wa-chat-bubble-out-light'
                      : 'wa-chat-bubble-in-light border border-slate-200/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.body}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] opacity-70">
                    <span>
                      {new Date(item.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.type === 'outbound' && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Direct Reply Input Footer */}
        <form onSubmit={handleSendDirectReply} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Type a direct WhatsApp reply to +${activePhone}...`}
            className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
          <button
            type="submit"
            disabled={isSendingReply || !replyText.trim()}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition flex items-center space-x-2 shrink-0"
          >
            <span>Send Reply</span>
            <Send className="w-3.5 h-3.5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
