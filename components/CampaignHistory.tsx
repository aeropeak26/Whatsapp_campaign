'use client';

import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';
import { Campaign, supabase } from '@/lib/supabase';

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setCampaigns(data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Campaign Execution History</h2>
            <p className="text-xs text-slate-500">Recorded campaign metrics from Supabase database</p>
          </div>
        </div>

        <button
          onClick={fetchCampaigns}
          disabled={isLoading}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-10 text-slate-400 space-y-2">
          <BarChart2 className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">No campaign records in Supabase yet.</p>
          <p className="text-[11px] text-slate-400">Launch a campaign to automatically store history.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Campaign Name</th>
                  <th className="px-4 py-3">Message Copy</th>
                  <th className="px-4 py-3 text-center">Contacts</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{c.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{c.default_message}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-800">
                      {c.total_contacts}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-400 font-mono text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
