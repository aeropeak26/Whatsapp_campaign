'use client';

import React, { useEffect, useState } from 'react';
import { LayoutTemplate, Trash2, ArrowUpRight, Plus, RefreshCw, Database } from 'lucide-react';
import { MessageTemplate, supabase } from '@/lib/supabase';

interface SavedTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

export default function SavedTemplates({ onSelectTemplate }: SavedTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setTemplates(data);
      }
    } catch (err) {
      console.warn('Failed to load templates from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      if (supabase) {
        await supabase.from('templates').delete().eq('id', id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Saved Templates (Supabase DB)</h2>
            <p className="text-xs text-gray-400">Reusable WhatsApp campaign copy</p>
          </div>
        </div>

        <button
          onClick={fetchTemplates}
          disabled={isLoading}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 space-y-2">
          <Database className="w-8 h-8 mx-auto text-gray-600 opacity-60" />
          <p className="text-xs">No saved templates in Supabase yet.</p>
          <p className="text-[11px] text-gray-600">Compose a message and click &quot;Save Template&quot; to store it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 flex flex-col justify-between space-y-2 hover:border-gray-700 transition group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                  <span>{tmpl.title}</span>
                  <button
                    onClick={() => handleDelete(tmpl.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {tmpl.content}
                </p>
              </div>

              <button
                onClick={() => onSelectTemplate(tmpl.content)}
                className="w-full py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 font-semibold text-xs rounded-lg border border-brand-500/20 transition flex items-center justify-center space-x-1"
              >
                <span>Use Template</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
