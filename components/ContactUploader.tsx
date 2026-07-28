'use client';

import React, { useState, ChangeEvent } from 'react';
import { Upload, Users, FileText, CheckCircle2, AlertTriangle, Trash2, ListPlus } from 'lucide-react';
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

export default function ContactUploader({ contacts, onContactsChange }: ContactUploaderProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Process raw lines of phone numbers
  const processRawLines = (lines: string[]) => {
    const parsed: ParsedContact[] = [];
    const seen = new Set<string>();

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Extract phone number digits
      const cleaned = cleanPhoneNumber(trimmed);
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

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextInput(val);
    const lines = val.split('\n');
    processRawLines(lines);
  };

  const parseFile = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setTextInput(text);
          processRawLines(text.split('\n'));
        }
      };
      reader.readAsText(file);
    } else {
      // CSV parse
      Papa.parse(file, {
        complete: (results) => {
          const parsed: ParsedContact[] = [];
          const seen = new Set<string>();

          results.data.forEach((row: any) => {
            let phoneVal = '';
            let nameVal = '';

            if (Array.isArray(row)) {
              phoneVal = row[0] || '';
              nameVal = row[1] || '';
            } else if (typeof row === 'object' && row !== null) {
              phoneVal = row.phone || row.mobile || row.Number || row.contact || Object.values(row)[0] || '';
              nameVal = row.name || row.Name || '';
            }

            const cleaned = cleanPhoneNumber(String(phoneVal));
            if (!cleaned) return;

            const isValid = cleaned.length >= 7 && cleaned.length <= 15;
            if (!seen.has(cleaned)) {
              seen.add(cleaned);
              parsed.push({
                phone: cleaned,
                name: nameVal ? String(nameVal).trim() : undefined,
                raw: String(phoneVal),
                isValid,
              });
            }
          });

          onContactsChange(parsed);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setTextInput('');
    onContactsChange([]);
  };

  const validCount = contacts.filter((c) => c.isValid).length;
  const invalidCount = contacts.filter((c) => !c.isValid).length;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-gray-800 space-y-4">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Target Contacts</h2>
            <p className="text-xs text-gray-400">Upload or paste WhatsApp recipient numbers</p>
          </div>
        </div>

        {/* Action & Stats Badges */}
        <div className="flex items-center space-x-2">
          {contacts.length > 0 && (
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-gray-900/60 p-1 rounded-lg border border-gray-800 text-xs">
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
              Total: {contacts.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-800/40">
              Valid: {validCount}
            </span>
            {invalidCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 font-semibold border border-rose-800/40">
                Invalid: {invalidCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs selection: Manual Paste vs File Upload */}
      <div className="flex items-center space-x-2 border-b border-gray-800/60 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-2 px-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'text'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ListPlus className="w-4 h-4" />
          <span>Line-by-Line Paste</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`pb-2 px-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'file'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
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
            placeholder={`Paste recipient numbers (one per line):\n+15550192834\n+919876543210\n14155552671`}
            className="w-full p-3 bg-gray-900/90 border border-gray-800 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition resize-y"
          />
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center space-x-1">
            <span>Include country code without special symbols or dashes (e.g., 919876543210 or +15550192834).</span>
          </p>
        </div>
      )}

      {/* Tab 2: Drag and Drop File Upload */}
      {activeTab === 'file' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
            dragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
          }`}
        >
          <FileText className="w-10 h-10 mx-auto text-brand-400 mb-2 opacity-80" />
          <p className="text-sm font-semibold text-gray-200">Drag and drop your CSV or TXT file here</p>
          <p className="text-xs text-gray-400 mt-1">Supports files with headers like phone, mobile, or raw text lines</p>

          <label className="inline-block mt-4">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer inline-flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Browse File</span>
            </span>
          </label>
        </div>
      )}

      {/* Parsed Contacts Preview List */}
      {contacts.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2">
            <span>Parsed Recipient Preview (First 5):</span>
            <span className="text-brand-400">{validCount} Ready for dispatch</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {contacts.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 bg-gray-900/80 rounded-lg border border-gray-800/80 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-300">+{item.phone}</span>
                  {item.name && <span className="text-gray-400">({item.name})</span>}
                </div>
                <div>
                  {item.isValid ? (
                    <span className="flex items-center space-x-1 text-emerald-400 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-400 font-medium text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Invalid</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            {contacts.length > 5 && (
              <div className="text-center text-[11px] text-gray-500 py-1 font-mono">
                ...and {contacts.length - 5} more numbers loaded
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
