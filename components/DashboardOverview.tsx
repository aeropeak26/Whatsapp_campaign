'use client';

import React from 'react';
import { Send, CheckCircle2, MessageCircle, BarChart3, Rocket, ArrowUpRight, TrendingUp, Users } from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  totalSent: number;
  unreadReplies: number;
}

export default function DashboardOverview({ onNavigate, totalSent, unreadReplies }: DashboardOverviewProps) {
  const stats = [
    {
      title: 'Total Dispatched',
      value: totalSent || 124,
      change: '+18% this week',
      icon: Send,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Delivery Rate',
      value: '98.4%',
      change: 'High reliability',
      icon: CheckCircle2,
      bgColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Customer Replies',
      value: unreadReplies || 14,
      change: 'Active responses',
      icon: MessageCircle,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      title: 'Active Campaigns',
      value: 6,
      change: 'Meta Cloud API',
      icon: BarChart3,
      bgColor: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-500 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
              Enterprise Dashboard
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome back, Jayaprakash!</h2>
          <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
            Your WhatsApp Business Cloud API is online. Send high-converting marketing dispatches and manage incoming customer replies directly from your workspace.
          </p>
        </div>

        <button
          onClick={() => onNavigate('campaign')}
          className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center space-x-2 shrink-0"
        >
          <Rocket className="w-4 h-4 text-brand-600" />
          <span>Launch New Campaign</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2.5 rounded-xl border ${stat.bgColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Launch Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Quick Campaign Launcher</h3>
            <span className="text-xs text-brand-600 font-semibold">Form Setup</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload recipient phone numbers line-by-line or via CSV file, choose a marketing template, and view live smartphone previews before dispatching.
          </p>
          <button
            onClick={() => onNavigate('campaign')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
          >
            <span>Open Campaign Form</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Replies Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Inbound Replies &amp; History</h3>
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Live Inbox
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            View customer responses to your campaign dispatches, inspect recipient message history, and send direct 1-on-1 replies.
          </p>
          <button
            onClick={() => onNavigate('replies')}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2"
          >
            <span>View Replies Inbox</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
