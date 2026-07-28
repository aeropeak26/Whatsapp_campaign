'use client';

import React, { useState } from 'react';
import { Database, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

const SQL_SCRIPT = `-- Run this script in your Supabase SQL Editor (vwjbrdglihwdjspetmge.supabase.co)

CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    default_message TEXT,
    total_contacts INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    status TEXT NOT NULL,
    message_id TEXT,
    error TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inbound_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    contact_name TEXT,
    message_body TEXT NOT NULL,
    whatsapp_message_id TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read write on campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Allow public read write on templates" ON public.templates FOR ALL USING (true);
CREATE POLICY "Allow public read write on logs" ON public.logs FOR ALL USING (true);
CREATE POLICY "Allow public read write on inbound_replies" ON public.inbound_replies FOR ALL USING (true);
`;

export default function DatabaseSetupBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Supabase Schema &amp; Table Setup</h3>
            <p className="text-slate-500 text-[11px]">
              Connected to project <span className="font-mono text-emerald-700 font-bold">vwjbrdglihwdjspetmge</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySql}
            className="px-3.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-300 shadow-2xs transition flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>SQL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Script</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2">
          <p className="text-slate-600 text-[11px]">
            Run the SQL snippet below in your Supabase Dashboard &gt; SQL Editor to set up tables (`campaigns`, `templates`, `logs`, `inbound_replies`):
          </p>
          <pre className="p-3.5 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-relaxed">
            {SQL_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
}
