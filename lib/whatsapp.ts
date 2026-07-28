export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

export interface SendMessageOptions {
  recipientPhone: string;
  messageType: 'text' | 'template';
  textBody?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
  config: WhatsAppConfig;
}

/**
 * Clean phone numbers into WhatsApp Meta Cloud API standard format (digits only, e.g. 15551234567)
 */
export function cleanPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly;
}

/**
 * Validate Meta WhatsApp Business API Credentials by making a lightweight GET request
 */
export async function verifyWhatsAppConfig(config: WhatsAppConfig): Promise<{ valid: boolean; error?: string; displayPhone?: string }> {
  const version = config.apiVersion || 'v19.0';
  if (!config.phoneNumberId || !config.accessToken) {
    return { valid: false, error: 'Phone Number ID and Access Token are required.' };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${config.phoneNumberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        valid: false,
        error: data?.error?.message || `HTTP ${res.status}: Failed to authenticate with WhatsApp Cloud API.`,
      };
    }

    return {
      valid: true,
      displayPhone: data?.display_phone_number || data?.verified_name || 'Verified WhatsApp Business Account',
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Network error verifying credentials.' };
  }
}

/**
 * Send individual message via Meta WhatsApp Business Cloud API
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { recipientPhone, messageType, textBody, templateName, templateLanguage = 'en_US', templateParams = [], config } = options;

  const cleanPhone = cleanPhoneNumber(recipientPhone);
  if (!cleanPhone || cleanPhone.length < 7) {
    return { success: false, error: 'Invalid phone number format.' };
  }

  const version = config.apiVersion || 'v19.0';
  const url = `https://graph.facebook.com/${version}/${config.phoneNumberId}/messages`;

  let payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
  };

  if (messageType === 'template') {
    payload.type = 'template';
    payload.template = {
      name: templateName || 'hello_world',
      language: {
        code: templateLanguage,
      },
    };

    if (templateParams.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters: templateParams.map(param => ({
            type: 'text',
            text: param,
          })),
        },
      ];
    }
  } else {
    payload.type = 'text';
    payload.text = {
      preview_url: false,
      body: textBody || '',
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.error?.error_data?.details || `API returned status ${response.status}`;
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id || 'msg_success';
    return { success: true, messageId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send HTTP request to WhatsApp API' };
  }
}
