import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vwjbrdglihwdjspetmge.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Campaign {
  id?: string;
  name: string;
  default_message: string;
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  status: 'draft' | 'running' | 'completed' | 'paused' | 'failed';
  created_at?: string;
}

export interface ContactItem {
  id?: string;
  campaign_id?: string;
  phone: string;
  name?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
}

export interface MessageTemplate {
  id?: string;
  title: string;
  content: string;
  category?: string;
  created_at?: string;
}

export interface SendLog {
  id?: string;
  campaign_id?: string;
  phone: string;
  status: 'sent' | 'failed';
  message_id?: string;
  error?: string;
  timestamp: string;
}

export interface InboundReply {
  id?: string;
  phone: string;
  contact_name?: string;
  message_body: string;
  whatsapp_message_id?: string;
  received_at: string;
  is_read?: boolean;
}
