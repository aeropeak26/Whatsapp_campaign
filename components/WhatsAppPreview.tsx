'use client';

import React from 'react';
import { Smartphone, CheckCheck, Phone, Video, MoreVertical, Send, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';

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
  // Format live variables for preview
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
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-3 flex flex-col justify-between">
      {/* Title Header */}
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Live Mobile Preview</h2>
          <p className="text-xs text-gray-400">Real-time WhatsApp customer screen view</p>
        </div>
      </div>

      {/* Mockup Smartphone Container */}
      <div className="relative mx-auto w-full max-w-[320px] rounded-[32px] border-4 border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="w-28 h-4 bg-gray-800 mx-auto rounded-b-xl flex items-center justify-center space-x-1.5 px-2">
          <div className="w-2 h-2 rounded-full bg-gray-900"></div>
          <div className="w-8 h-1 rounded-full bg-gray-900"></div>
        </div>

        {/* WhatsApp App Bar Header */}
        <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between border-b border-gray-800/50 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
              WB
            </div>
            <div>
              <h4 className="text-xs font-semibold leading-tight">Your Business</h4>
              <p className="text-[10px] text-emerald-400 leading-none">Official Account</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <Video className="w-3.5 h-3.5" />
            <Phone className="w-3.5 h-3.5" />
            <MoreVertical className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="wa-chat-bg p-3 min-h-[260px] max-h-[300px] flex flex-col justify-end space-y-2 overflow-y-auto">
          {/* Timestamp divider */}
          <div className="mx-auto bg-[#182229] px-2.5 py-0.5 rounded-md text-[10px] text-gray-400 font-medium shadow-sm">
            Today
          </div>

          {/* Outgoing Message Bubble */}
          <div className="self-end max-w-[85%] wa-chat-bubble-out text-white p-2.5 shadow-md relative text-xs leading-relaxed break-words">
            <div className="whitespace-pre-wrap">{formattedPreviewText()}</div>

            {/* Bubble Footer timestamp & double ticks */}
            <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-emerald-200/80">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* WhatsApp Input Bar Footer */}
        <div className="bg-[#1f2c34] px-2 py-2 flex items-center space-x-2 text-gray-400">
          <Smile className="w-4 h-4" />
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1 text-[11px] text-gray-400">
            Message
          </div>
          <Paperclip className="w-4 h-4" />
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-slate-950">
            <Send className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
