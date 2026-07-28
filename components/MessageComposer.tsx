'use client';

import React, { useState } from 'react';
import { Edit3, Sparkles, Tag, LayoutTemplate, Save, FileText, Check } from 'lucide-react';
import { MessageTemplate, supabase } from '@/lib/supabase';

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

const PRESET_TEMPLATES = [
  {
    title: '🔥 Promotional Offer',
    content: 'Hello {name}! 🎉 Get 20% OFF on all services today only. Use code SPECIAL20. Claim now!',
  },
  {
    title: '📅 Appointment Reminder',
    content: 'Hi {name}, this is a quick reminder for your appointment tomorrow at 10:00 AM. Reply YES to confirm.',
  },
  {
    title: '📦 Order Status Update',
    content: 'Dear Customer, your order #{1} has been shipped! Track your package here: https://example.com/track',
  },
  {
    title: '👋 Welcome Message',
    content: 'Welcome to our platform, {name}! We are excited to have you on board. Reply HELP anytime if you need support.',
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

  const handleInsertVariable = (variableTag: string) => {
    onMessageTextChange(messageText + variableTag);
  };

  const handleSelectPreset = (content: string) => {
    onMessageTextChange(content);
  };

  const handleSaveToSupabase = async () => {
    if (!messageText.trim()) return;

    try {
      if (supabase) {
        await supabase.from('templates').insert([{
          title: `Template - ${new Date().toLocaleDateString()}`,
          content: messageText,
          category: 'custom',
        }]);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save template to Supabase:', err);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Campaign Message</h2>
            <p className="text-xs text-gray-400">Compose text message or set WhatsApp Template</p>
          </div>
        </div>

        {/* Message Type Selector Toggle */}
        <div className="flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-semibold">
          <button
            onClick={() => onMessageTypeChange('text')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              messageType === 'text'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom Message</span>
          </button>
          <button
            onClick={() => onMessageTypeChange('template')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
              messageType === 'template'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Approved Meta Template</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Custom Free-Text Message */}
      {messageType === 'text' && (
        <div className="space-y-3">
          {/* Quick Insert Placeholders */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              <span>Insert Tags:</span>
            </span>
            <button
              onClick={() => handleInsertVariable('{name}')}
              className="px-2.5 py-1 bg-gray-800/80 hover:bg-gray-700 text-brand-300 rounded-lg border border-gray-700 font-mono transition"
            >
              + &#123;name&#125;
            </button>
            <button
              onClick={() => handleInsertVariable('{phone}')}
              className="px-2.5 py-1 bg-gray-800/80 hover:bg-gray-700 text-brand-300 rounded-lg border border-gray-700 font-mono transition"
            >
              + &#123;phone&#125;
            </button>
            <button
              onClick={() => handleInsertVariable('{{1}}')}
              className="px-2.5 py-1 bg-gray-800/80 hover:bg-gray-700 text-brand-300 rounded-lg border border-gray-700 font-mono transition"
            >
              + &#123;&#123;1&#125;&#125;
            </button>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => onMessageTextChange(e.target.value)}
              placeholder="Type your WhatsApp campaign message here..."
              className="w-full p-3.5 bg-gray-900/90 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-y"
            />
            <div className="absolute right-3 bottom-3 text-[11px] text-gray-500 font-mono">
              {messageText.length} chars
            </div>
          </div>

          {/* Save & Preset Templates */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Presets:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.content)}
                    className="px-2.5 py-1 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 rounded-lg border border-gray-700/60 text-xs transition"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveToSupabase}
              className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 ml-auto"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Supabase!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Meta WhatsApp Template Mode */}
      {messageType === 'template' && (
        <div className="space-y-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Meta Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                placeholder="e.g. hello_world or order_update"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Must match exact template name in Meta Manager</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Language Code
              </label>
              <select
                value={templateLanguage}
                onChange={(e) => onTemplateLanguageChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="en_US">English (US) - en_US</option>
                <option value="en_GB">English (UK) - en_GB</option>
                <option value="es">Spanish - es</option>
                <option value="hi">Hindi - hi</option>
                <option value="pt_BR">Portuguese (BR) - pt_BR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Template Body Variables (Comma-separated for &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125;)
            </label>
            <input
              type="text"
              value={templateParams.join(', ')}
              onChange={(e) =>
                onTemplateParamsChange(e.target.value.split(',').map((s) => s.trim()))
              }
              placeholder="e.g. John Doe, 12345"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
