'use client';

import React, { useState } from 'react';
import { Database, Code, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

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

-- Enable RLS and public permissions
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read write on campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Allow public read write on templates" ON public.templates FOR ALL USING (true);
CREATE POLICY "Allow public read write on logs" ON public.logs FOR ALL USING (true);
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
    <div className="glass-panel rounded-2xl p-4 border border-emerald-800/40 bg-emerald-950/20 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white">Supabase Schema &amp; Table Setup</h3>
            <p className="text-gray-400 text-[11px]">
              Connected to project <span className="font-mono text-emerald-400">vwjbrdglihwdjspetmge</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 font-semibold rounded-lg border border-emerald-700/50 transition flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
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
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-emerald-900/40 space-y-2">
          <p className="text-gray-300 text-[11px]">
            Run the SQL snippet below in your Supabase Dashboard &gt; SQL Editor to enable automatic campaign logging &amp; saved template storage:
          </p>
          <pre className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-48 leading-normal">
            {SQL_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
}
