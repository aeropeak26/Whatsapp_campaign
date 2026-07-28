'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Upload, Users, FileText, CheckCircle2, AlertTriangle, Trash2, ListPlus, Globe } from 'lucide-react';
import Papa from 'papaparse';
import { cleanPhoneNumber } from '@/lib/whatsapp';

export interface ParsedContact {
  phone: string;
  name?: string;
  raw: string;
  isValid: boolean;
}

interface ContactUploaderProps {
  contacts: ParsedContact[];
  onContactsChange: (contacts: ParsedContact[]) => void;
}

export const COUNTRY_CODES = [
  { code: '91', label: '🇮🇳 +91 (India)', name: 'India' },
  { code: '1', label: '🇺🇸 +1 (US / Canada)', name: 'USA/Canada' },
  { code: '44', label: '🇬🇧 +44 (United Kingdom)', name: 'UK' },
  { code: '971', label: '🇦🇪 +971 (UAE)', name: 'UAE' },
  { code: '65', label: '🇸🇬 +65 (Singapore)', name: 'Singapore' },
  { code: '61', label: '🇦🇺 +61 (Australia)', name: 'Australia' },
  { code: '966', label: '🇸🇦 +966 (Saudi Arabia)', name: 'Saudi Arabia' },
  { code: '60', label: '🇲🇾 +60 (Malaysia)', name: 'Malaysia' },
  { code: '92', label: '🇵🇰 +92 (Pakistan)', name: 'Pakistan' },
  { code: '880', label: '🇧🇩 +880 (Bangladesh)', name: 'Bangladesh' },
  { code: 'custom', label: '🌐 Custom Country Code', name: 'Custom' },
];

export default function ContactUploader({ contacts, onContactsChange }: ContactUploaderProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Global country code selection (Default: +91 India)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('91');
  const [customCountryCode, setCustomCountryCode] = useState<string>('');

  const activePrefix = selectedCountryCode === 'custom' ? customCountryCode.replace(/\D/g, '') : selectedCountryCode;

  // Process raw lines of phone numbers with country code formatting
  const processRawLines = (lines: string[], prefixCode: string) => {
    const parsed: ParsedContact[] = [];
    const seen = new Set<string>();

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      let cleaned = cleanPhoneNumber(trimmed);

      // If number is a local number (e.g. 10 digits in India or 7-10 digits without leading prefix)
      // and doesn't start with the international country code, prepend default country code!
      if (prefixCode && cleaned.length >= 7 && cleaned.length <= 10) {
        // If it doesn't already start with the prefix code
        if (!cleaned.startsWith(prefixCode)) {
          cleaned = prefixCode + cleaned;
        }
      }

      const isValid = cleaned.length >= 7 && cleaned.length <= 15;

      if (!seen.has(cleaned)) {
        if (cleaned) seen.add(cleaned);
        parsed.push({
          phone: cleaned,
          raw: trimmed,
          isValid,
        });
      }
    }

    onContactsChange(parsed);
  };

  // Re-process when country code changes
  useEffect(() => {
    if (textInput.trim()) {
      processRawLines(textInput.split('\n'), activePrefix);
    }
  }, [selectedCountryCode, customCountryCode]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    processRawLines(val.split('\n'), activePrefix);
  };

  const parseFile = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setTextInput(text);
          processRawLines(text.split('\n'), activePrefix);
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        complete: (results) => {
          const rawLines: string[] = [];
          results.data.forEach((row: any) => {
            let phoneVal = '';
            if (Array.isArray(row)) {
              phoneVal = row[0] || '';
            } else if (typeof row === 'object' && row !== null) {
              phoneVal = row.phone || row.mobile || row.Number || row.contact || Object.values(row)[0] || '';
            }
            if (phoneVal) rawLines.push(String(phoneVal));
          });

          setTextInput(rawLines.join('\n'));
          processRawLines(rawLines, activePrefix);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleClear = () => {
    setTextInput('');
    onContactsChange([]);
  };

  const validCount = contacts.filter((c) => c.isValid).length;
  const invalidCount = contacts.filter((c) => !c.isValid).length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Target Contacts</h2>
            <p className="text-xs text-slate-500">Upload bulk recipient numbers (100+ contacts supported)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {contacts.length > 0 && (
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-bold shadow-2xs">
              Total: {contacts.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Valid: {validCount}
            </span>
            {invalidCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                Invalid: {invalidCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Country Code Selector Section */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Default Country Code Prefix for All Numbers:</span>
          </label>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500 shadow-2xs"
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>

            {selectedCountryCode === 'custom' && (
              <input
                type="text"
                placeholder="e.g. 33 for France"
                value={customCountryCode}
                onChange={(e) => setCustomCountryCode(e.target.value)}
                className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-500"
              />
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Auto-applies <strong className="text-slate-800 font-mono">+{activePrefix || '91'}</strong> to any 10-digit or local number pasted without a country prefix.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-100 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-2 px-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'text'
              ? 'border-brand-500 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Paste 100+ Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`pb-2 px-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'file'
              ? 'border-brand-500 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>CSV / TXT File Upload</span>
        </button>
      </div>

      {/* Tab 1: Line-by-Line Textarea */}
      {activeTab === 'text' && (
        <div>
          <textarea
            rows={6}
            value={textInput}
            onChange={handleTextChange}
            placeholder={`Paste 100+ recipient numbers (one per line):\n9876543210\n9876543211\n9876543212\n+919876543213`}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-y"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            You can paste raw 10-digit numbers — <strong className="text-slate-700">+{activePrefix || '91'}</strong> will be automatically added to all numbers in bulk.
          </p>
        </div>
      )}

      {/* Tab 2: File Upload */}
      {activeTab === 'file' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
            dragActive
              ? 'border-brand-500 bg-brand-50'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <FileText className="w-10 h-10 mx-auto text-brand-500 mb-2 opacity-80" />
          <p className="text-sm font-bold text-slate-800">Drag and drop your contact file here</p>
          <p className="text-xs text-slate-400 mt-1">Upload CSV or TXT file with 100+ numbers</p>

          <label className="inline-block mt-4">
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            <span className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer inline-flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Browse File</span>
            </span>
          </label>
        </div>
      )}

      {/* Parsed Contacts Preview List */}
      {contacts.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Parsed Contacts List ({contacts.length} Total Loaded):</span>
            <span className="text-brand-600 font-bold">{validCount} Formatted with +{activePrefix || '91'}</span>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {contacts.slice(0, 8).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-800 font-bold">+{item.phone}</span>
                  {item.name && <span className="text-slate-500">({item.name})</span>}
                </div>
                <div>
                  {item.isValid ? (
                    <span className="flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-600 font-bold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Invalid</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            {contacts.length > 8 && (
              <div className="text-center text-[11px] text-slate-400 py-1 font-mono">
                ...and {contacts.length - 8} more contacts ready for campaign dispatch
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
