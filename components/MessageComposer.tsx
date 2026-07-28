'use client';

import React, { useState } from 'react';
import { Edit3, Sparkles, Tag, LayoutTemplate, Save, FileText, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MessageComposerProps {
  messageType: 'text' | 'template';
  onMessageTypeChange: (type: 'text' | 'template') => void;
  messageText: string;
  onMessageTextChange: (text: string) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  templateLanguage: string;
  onTemplateLanguageChange: (lang: string) => void;
  templateParams: string[];
  onTemplateParamsChange: (params: string[]) => void;
}

export const AEROPEAK_DEFAULT_MESSAGE = `Hi 👋,

I'm *Jayaprakash* from *AeroPeak* .

I came across your business and thought a professional website could help you attract more customers, build trust, and grow your online presence.

We specialize in:
🌐 Business Websites
🛒 E-commerce Websites
📱 Mobile App Development
🎨 UI/UX Design
🔧 Website Maintenance

You can learn more about our company and services here:
🌐 https://aeropeak.tech

If you're planning to build a new website or improve your existing one, I'd be happy to discuss your requirements and suggest the best solution.

Looking forward to hearing from you.

*AeroPeak*
Developing Ideas. Delivering Impact.`;

const PRESET_TEMPLATES = [
  {
    title: '🚀 AeroPeak Services Outreach',
    content: AEROPEAK_DEFAULT_MESSAGE,
  },
  {
    title: '🔥 Promotional Offer',
    content: 'Hello {name}! 🎉 Get 20% OFF on all services today only. Use code SPECIAL20. Claim now!',
  },
  {
    title: '📅 Appointment Reminder',
    content: 'Hi {name}, this is a quick reminder for your appointment tomorrow at 10:00 AM. Reply YES to confirm.',
  },
];

export default function MessageComposer({
  messageType,
  onMessageTypeChange,
  messageText,
  onMessageTextChange,
  templateName,
  onTemplateNameChange,
  templateLanguage,
  onTemplateLanguageChange,
  templateParams,
  onTemplateParamsChange,
}: MessageComposerProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInsertVariable = (tag: string) => {
    onMessageTextChange(messageText + tag);
  };

  const handleSaveToSupabase = async () => {
    if (!messageText.trim()) return;

    try {
      if (supabase) {
        await supabase.from('templates').insert([
          {
            title: `Template - ${new Date().toLocaleDateString()}`,
            content: messageText,
            category: 'custom',
          },
        ]);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Message Copy</h2>
            <p className="text-xs text-slate-500">Edit custom message or choose approved Meta template</p>
          </div>
        </div>

        {/* Message Type Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => onMessageTypeChange('text')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              messageType === 'text'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom Message</span>
          </button>
          <button
            onClick={() => onMessageTypeChange('template')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              messageType === 'template'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Approved Meta Template</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Custom Text */}
      {messageType === 'text' && (
        <div className="space-y-3">
          {/* Quick Placeholders */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              <span>Variables:</span>
            </span>
            <button
              onClick={() => handleInsertVariable('{name}')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-brand-700 font-bold rounded-lg border border-slate-200 font-mono transition"
            >
              + &#123;name&#125;
            </button>
            <button
              onClick={() => handleInsertVariable('{phone}')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-brand-700 font-bold rounded-lg border border-slate-200 font-mono transition"
            >
              + &#123;phone&#125;
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={9}
              value={messageText}
              onChange={(e) => onMessageTextChange(e.target.value)}
              placeholder="Type your WhatsApp campaign message here..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-900 leading-relaxed placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-y"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-slate-400 font-mono">
              {messageText.length} chars
            </div>
          </div>

          {/* Presets & Save */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Presets:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => onMessageTextChange(preset.content)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 text-xs transition"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveToSupabase}
              className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5 ml-auto shadow-2xs"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved to Supabase!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Meta Template Mode */}
      {messageType === 'template' && (
        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meta Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                placeholder="e.g. hello_world"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Language Code
              </label>
              <select
                value={templateLanguage}
                onChange={(e) => onTemplateLanguageChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="en_US">English (US) - en_US</option>
                <option value="hi">Hindi - hi</option>
                <option value="es">Spanish - es</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
