'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ApiConfigModal from '@/components/ApiConfigModal';
import ContactUploader, { ParsedContact } from '@/components/ContactUploader';
import MessageComposer from '@/components/MessageComposer';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import CampaignMonitor from '@/components/CampaignMonitor';
import SavedTemplates from '@/components/SavedTemplates';
import CampaignHistory from '@/components/CampaignHistory';
import DatabaseSetupBanner from '@/components/DatabaseSetupBanner';
import { WhatsAppConfig } from '@/lib/whatsapp';
import { Rocket, History, LayoutTemplate, Settings, Sparkles, HelpCircle, Layers } from 'lucide-react';

export default function Home() {
  const [activeNav, setActiveNav] = useState<'campaign' | 'templates' | 'history'>('campaign');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [totalSentCount, setTotalSentCount] = useState(0);

  // WhatsApp API Config
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    apiVersion: 'v19.0',
  });
  const [apiPhoneDisplay, setApiPhoneDisplay] = useState<string | undefined>();

  // Campaign State
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [messageType, setMessageType] = useState<'text' | 'template'>('text');
  const [messageText, setMessageText] = useState(
    'Hello {name}! 👋 Thank you for connecting with us. Check out our latest updates!'
  );
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const [templateParams, setTemplateParams] = useState<string[]>([]);

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('wa_api_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('wa_api_config', JSON.stringify(newConfig));
  };

  const isApiConfigured = Boolean(config.phoneNumberId && config.accessToken);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-gray-100 font-sans">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        isApiConfigured={isApiConfigured}
        apiPhoneDisplay={apiPhoneDisplay}
        totalSentCount={totalSentCount}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Supabase Banner */}
        <DatabaseSetupBanner />

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 overflow-x-auto">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <button
              onClick={() => setActiveNav('campaign')}
              className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                activeNav === 'campaign'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>New Blast Campaign</span>
            </button>

            <button
              onClick={() => setActiveNav('templates')}
              className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                activeNav === 'templates'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Saved Copy Library</span>
            </button>

            <button
              onClick={() => setActiveNav('history')}
              className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                activeNav === 'history'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Campaign History</span>
            </button>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition flex items-center space-x-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">API Credentials</span>
          </button>
        </div>

        {/* Tab 1: New Blast Campaign Workspace */}
        {activeNav === 'campaign' && (
          <div className="space-y-6">
            {/* Grid 1: Contacts Uploader & Message Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Contact Uploader & Message Editor */}
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

              {/* Right Column: Interactive Smartphone WhatsApp Mobile Preview */}
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

            {/* Campaign Execution Monitor & Batch Dispatcher */}
            <CampaignMonitor
              contacts={contacts}
              messageType={messageType}
              messageText={messageText}
              templateName={templateName}
              templateLanguage={templateLanguage}
              templateParams={templateParams}
              config={config}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onIncrementTotalSent={() => setTotalSentCount((prev) => prev + 1)}
            />
          </div>
        )}

        {/* Tab 2: Saved Copy Templates */}
        {activeNav === 'templates' && (
          <SavedTemplates
            onSelectTemplate={(content) => {
              setMessageText(content);
              setActiveNav('campaign');
            }}
          />
        )}

        {/* Tab 3: Campaign Execution Analytics & Log History */}
        {activeNav === 'history' && <CampaignHistory />}
      </main>

      {/* API Credentials Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
