'use client';

import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, XCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { Campaign, supabase } from '@/lib/supabase';

export default function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) setCampaigns(data);
      }
    } catch (err) {
      console.warn('Failed to load campaigns from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Campaign Execution History</h2>
            <p className="text-xs text-gray-400">Recorded campaign metrics from Supabase database</p>
          </div>
        </div>

        <button
          onClick={fetchCampaigns}
          disabled={isLoading}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-500 space-y-2">
          <BarChart2 className="w-8 h-8 mx-auto text-gray-600 opacity-60" />
          <p className="text-xs">No campaign history recorded in Supabase yet.</p>
          <p className="text-[11px] text-gray-600">Start a WhatsApp blast to automatically log history.</p>
        </div>
      ) : (
        <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/60">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-800/80 text-gray-400 font-semibold sticky top-0 uppercase tracking-wider border-b border-gray-700">
                <tr>
                  <th className="px-4 py-2.5">Campaign Name</th>
                  <th className="px-4 py-2.5">Message Copy</th>
                  <th className="px-4 py-2.5 text-center">Contacts</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-2.5 font-semibold text-white">{c.name}</td>
                    <td className="px-4 py-2.5 text-gray-400 max-w-xs truncate">{c.default_message}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-semibold text-gray-200">
                      {c.total_contacts}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500 font-mono text-[11px]">
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
