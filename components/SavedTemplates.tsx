'use client';

import React, { useEffect, useState } from 'react';
import { LayoutTemplate, Trash2, ArrowUpRight, RefreshCw, Database } from 'lucide-react';
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
        const { data } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setTemplates(data);
      }
    } catch (err) {
      console.warn(err);
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
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Saved Message Templates</h2>
            <p className="text-xs text-slate-500">Stored copy in Supabase Database</p>
          </div>
        </div>

        <button
          onClick={fetchTemplates}
          disabled={isLoading}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <Database className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">No templates stored in Supabase yet.</p>
          <p className="text-[11px] text-slate-400">Save a template from the Campaign Form to store it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-brand-300 transition group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>{tmpl.title}</span>
                  <button
                    onClick={() => handleDelete(tmpl.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {tmpl.content}
                </p>
              </div>

              <button
                onClick={() => onSelectTemplate(tmpl.content)}
                className="w-full py-2 bg-white hover:bg-brand-500 hover:text-white text-brand-700 font-bold text-xs rounded-xl border border-brand-200 shadow-2xs transition flex items-center justify-center space-x-1"
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
