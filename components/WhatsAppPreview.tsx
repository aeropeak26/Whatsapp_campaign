'use client';

import React from 'react';
import { Smartphone, CheckCheck, Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';

interface WhatsAppPreviewProps {
  messageText: string;
  messageType: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

export default function WhatsAppPreview({
  messageText,
  messageType,
  templateName,
  templateParams = [],
}: WhatsAppPreviewProps) {
  const formattedPreviewText = () => {
    if (messageType === 'template') {
      let body = `[Meta Template: ${templateName || 'hello_world'}]`;
      if (templateParams.length > 0) {
        body += `\nParameters: ${templateParams.join(', ')}`;
      }
      return body;
    }

    if (!messageText.trim()) return 'Your message preview will appear here...';

    return messageText
      .replace(/\{name\}/gi, 'Alex Morgan')
      .replace(/\{phone\}/gi, '+1 555-019-2834')
      .replace(/\{\{1\}\}/g, 'Alex')
      .replace(/\{\{2\}\}/g, '20% OFF');
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Live Mobile Preview</h2>
          <p className="text-xs text-slate-500">Real-time customer screen render</p>
        </div>
      </div>

      {/* Smartphone Frame */}
      <div className="relative mx-auto w-full max-w-[310px] rounded-[32px] border-4 border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="w-28 h-4 bg-slate-800 mx-auto rounded-b-xl flex items-center justify-center space-x-1.5 px-2">
          <div className="w-2 h-2 rounded-full bg-slate-900"></div>
          <div className="w-8 h-1 rounded-full bg-slate-900"></div>
        </div>

        {/* WhatsApp App Bar */}
        <div className="bg-[#008069] px-3 py-2.5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-emerald-800 font-bold flex items-center justify-center text-xs shadow-md">
              WB
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">Your Business</h4>
              <p className="text-[10px] text-emerald-100 leading-none">Official Account</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-emerald-100">
            <Video className="w-3.5 h-3.5" />
            <Phone className="w-3.5 h-3.5" />
            <MoreVertical className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="wa-chat-bg-light p-3 min-h-[260px] max-h-[300px] flex flex-col justify-end space-y-2 overflow-y-auto">
          <div className="mx-auto bg-white/90 px-2.5 py-0.5 rounded-md text-[10px] text-slate-600 font-medium shadow-2xs">
            Today
          </div>

          <div className="self-end max-w-[85%] wa-chat-bubble-out-light p-2.5 shadow-sm relative text-xs leading-relaxed break-words">
            <div className="whitespace-pre-wrap">{formattedPreviewText()}</div>

            <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-emerald-800">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* WhatsApp Input Bar */}
        <div className="bg-slate-100 px-2 py-2 flex items-center space-x-2 text-slate-400">
          <Smile className="w-4 h-4" />
          <div className="flex-1 bg-white rounded-full px-3 py-1 text-[11px] text-slate-400 border border-slate-200">
            Message
          </div>
          <Paperclip className="w-4 h-4" />
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white">
            <Send className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
