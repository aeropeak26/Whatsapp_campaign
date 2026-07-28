'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import Sidebar, { NavTab } from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import ContactUploader, { ParsedContact } from '@/components/ContactUploader';
import MessageComposer, { AEROPEAK_DEFAULT_MESSAGE } from '@/components/MessageComposer';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import CampaignMonitor from '@/components/CampaignMonitor';
import RepliesInbox from '@/components/RepliesInbox';
import SavedTemplates from '@/components/SavedTemplates';
import CampaignHistory from '@/components/CampaignHistory';
import DatabaseSetupBanner from '@/components/DatabaseSetupBanner';
import ApiConfigModal from '@/components/ApiConfigModal';
import { WhatsAppConfig } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { Settings, ShieldCheck, Key, RefreshCw, HelpCircle } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [totalSentCount, setTotalSentCount] = useState(0);

  // WhatsApp API Configuration
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    apiVersion: 'v19.0',
  });

  // Campaign State
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [messageType, setMessageType] = useState<'text' | 'template'>('text');
  const [messageText, setMessageText] = useState(AEROPEAK_DEFAULT_MESSAGE);
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const [templateParams, setTemplateParams] = useState<string[]>([]);

  // Check auth and local/Supabase configuration on mount
  useEffect(() => {
    const authSession = localStorage.getItem('wa_blast_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    const savedConfig = localStorage.getItem('wa_api_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error(e);
      }
    }

    // Attempt loading saved credentials from Supabase DB
    async function loadSupabaseSettings() {
      try {
        if (supabase) {
          const { data } = await supabase.from('settings').select('*').eq('id', 'default').single();
          if (data && data.phone_number_id && data.access_token) {
            const fetched = {
              phoneNumberId: data.phone_number_id,
              accessToken: data.access_token,
              apiVersion: data.api_version || 'v19.0',
            };
            setConfig(fetched);
            localStorage.setItem('wa_api_config', JSON.stringify(fetched));
          }
        }
      } catch (err) {
        console.warn('Supabase settings fetch skipped:', err);
      }
    }

    loadSupabaseSettings();
  }, []);

  const handleSaveConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('wa_api_config', JSON.stringify(newConfig));
  };

  const handleLogout = () => {
    localStorage.removeItem('wa_blast_auth');
    setIsAuthenticated(false);
  };

  // Guard: If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const isApiConfigured = Boolean(config.phoneNumberId && config.accessToken);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        unreadRepliesCount={2}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 capitalize tracking-tight">
              {activeTab === 'dashboard' && 'Workspace Dashboard'}
              {activeTab === 'campaign' && 'New WhatsApp Campaign Form'}
              {activeTab === 'replies' && 'Customer Replies & Chat Timeline'}
              {activeTab === 'templates' && 'Message Template Library'}
              {activeTab === 'history' && 'Campaign Execution Logs'}
              {activeTab === 'settings' && 'Meta Cloud API & Webhook Settings'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">WhatsApp Business Marketing Hub</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                isApiConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
              }`}
            >
              {isApiConfigured ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Meta Cloud API Connected</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Configure Meta Credentials</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Supabase SQL Banner */}
          <DatabaseSetupBanner />

          {/* Tab 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setActiveTab}
              totalSent={totalSentCount}
              unreadReplies={2}
            />
          )}

          {/* Tab 2: Campaign Form */}
          {activeTab === 'campaign' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <ContactUploader contacts={contacts} onContactsChange={setContacts} />
                  <MessageComposer
                    messageType={messageType}
                    onMessageTypeChange={setMessageType}
                    messageText={messageText}
                    onMessageTextChange={setMessageText}
                    templateName={templateName}
                    onTemplateNameChange={setTemplateName}
                    templateLanguage={templateLanguage}
                    onTemplateLanguageChange={setTemplateLanguage}
                    templateParams={templateParams}
                    onTemplateParamsChange={setTemplateParams}
                  />
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-24">
                    <WhatsAppPreview
                      messageText={messageText}
                      messageType={messageType}
                      templateName={templateName}
                      templateParams={templateParams}
                    />
                  </div>
                </div>
              </div>

              <CampaignMonitor
                contacts={contacts}
                messageType={messageType}
                messageText={messageText}
                templateName={templateName}
                templateLanguage={templateLanguage}
                templateParams={templateParams}
                config={config}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onIncrementTotalSent={() => setTotalSentCount((prev) => prev + 1)}
              />
            </div>
          )}

          {/* Tab 3: Customer Replies & Chat History */}
          {activeTab === 'replies' && <RepliesInbox config={config} />}

          {/* Tab 4: Templates Library */}
          {activeTab === 'templates' && (
            <SavedTemplates
              onSelectTemplate={(content) => {
                setMessageText(content);
                setActiveTab('campaign');
              }}
            />
          )}

          {/* Tab 5: History */}
          {activeTab === 'history' && <CampaignHistory />}

          {/* Tab 6: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                  <Key className="w-5 h-5 text-brand-600" />
                  <h3 className="text-base font-bold text-slate-900">Meta API &amp; Webhook Credentials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={config.phoneNumberId}
                      onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                      placeholder="e.g. 104857692348501"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Graph API Version
                    </label>
                    <select
                      value={config.apiVersion || 'v19.0'}
                      onChange={(e) => setConfig({ ...config, apiVersion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-brand-500"
                    >
                      <option value="v19.0">v19.0 (Latest Standard)</option>
                      <option value="v18.0">v18.0</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      System Access Token
                    </label>
                    <textarea
                      rows={3}
                      value={config.accessToken}
                      onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                      placeholder="EAAG..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:border-brand-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSaveConfig(config)}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <ApiConfigModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
