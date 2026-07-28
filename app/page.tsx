'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import Sidebar, { NavTab } from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardOverview from '@/components/DashboardOverview';
import LinkDeviceModal from '@/components/LinkDeviceModal';
import ContactUploader, { ParsedContact } from '@/components/ContactUploader';
import MessageComposer, { AEROPEAK_DEFAULT_MESSAGE } from '@/components/MessageComposer';
import WhatsAppPreview from '@/components/WhatsAppPreview';
import CampaignMonitor from '@/components/CampaignMonitor';
import RepliesInbox from '@/components/RepliesInbox';
import SavedTemplates from '@/components/SavedTemplates';
import CampaignHistory from '@/components/CampaignHistory';
import DatabaseSetupBanner from '@/components/DatabaseSetupBanner';
import { WASessionStatus } from '@/lib/types';
import { WhatsAppConfig } from '@/lib/whatsapp';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLinkDeviceModalOpen, setIsLinkDeviceModalOpen] = useState(false);
  const [totalSentCount, setTotalSentCount] = useState(0);

  // WhatsApp Linked Session State
  const [sessionStatus, setSessionStatus] = useState<WASessionStatus>({
    isConnected: false,
    status: 'disconnected',
  });

  // Default WhatsApp API config object for fallbacks
  const [config] = useState<WhatsAppConfig>({
    phoneNumberId: 'default',
    accessToken: 'default',
    apiVersion: 'v19.0',
  });

  // Campaign Form State
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [messageType, setMessageType] = useState<'text' | 'template'>('text');
  const [messageText, setMessageText] = useState(AEROPEAK_DEFAULT_MESSAGE);
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const [templateParams, setTemplateParams] = useState<string[]>([]);

  // Check auth & session status on mount
  useEffect(() => {
    const authSession = localStorage.getItem('wa_blast_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }

    async function checkSession() {
      try {
        const res = await fetch('/api/wa-device');
        const data = await res.json();
        if (data) setSessionStatus(data);
      } catch (err) {
        console.warn(err);
      }
    }

    checkSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('wa_blast_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

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
        {/* Top Header */}
        <Header
          onOpenLinkDevice={() => setIsLinkDeviceModalOpen(true)}
          sessionStatus={sessionStatus}
          totalSentCount={totalSentCount}
        />

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
                deviceState={sessionStatus as any}
                onOpenSettings={() => setIsLinkDeviceModalOpen(true)}
                onOpenLinkDevice={() => setIsLinkDeviceModalOpen(true)}
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
        </main>
      </div>

      {/* WhatsApp Link Phone Number (8-Digit Code) Modal */}
      <LinkDeviceModal
        isOpen={isLinkDeviceModalOpen}
        onClose={() => setIsLinkDeviceModalOpen(false)}
        sessionStatus={sessionStatus}
        onStatusChange={setSessionStatus}
      />
    </div>
  );
}
