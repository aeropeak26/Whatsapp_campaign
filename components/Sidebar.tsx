'use client';

import React from 'react';
import { LayoutDashboard, Send, MessageCircle, FileText, History, Settings, LogOut, MessageSquare, ChevronRight } from 'lucide-react';

export type NavTab = 'dashboard' | 'campaign' | 'replies' | 'templates' | 'history' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogout: () => void;
  unreadRepliesCount?: number;
}

export default function Sidebar({ activeTab, onTabChange, onLogout, unreadRepliesCount = 0 }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaign', label: 'Campaign', icon: Send },
    { id: 'replies', label: 'Replies', icon: MessageCircle, badge: unreadRepliesCount },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-sm z-30">
      {/* Top Section: Brand & Nav */}
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">WhatsApp Blast</h1>
            <p className="text-[11px] text-slate-500 font-medium">Enterprise Campaign</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-300">
            JP
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-slate-800 truncate">Jayaprakash R</p>
            <p className="text-[10px] text-slate-400 truncate">jayaprakash.r024@gmail.com</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
