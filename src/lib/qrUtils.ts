
import type { WifiQrInput, EmailQrInput, SmsQrInput, VCardQrInput } from './schemas';

export function formatWifiString(data: WifiQrInput): string {
  let wifiString = `WIFI:S:${data.ssid};`;
  if (data.encryption && data.encryption !== "nopass") {
    wifiString += `T:${data.encryption === "WPA2" ? "WPA" : data.encryption};`; // Common practice to use WPA for WPA2 in QR
  } else if (data.encryption === "nopass") {
    wifiString += `T:nopass;`;
  }
  if (data.password) {
    wifiString += `P:${data.password};`;
  }
  if (data.hidden) {
    wifiString += `H:true;`;
  }
  wifiString += ";";
  return wifiString;
}

export function formatEmailString(data: EmailQrInput): string {
  let emailString = `mailto:${data.email}`;
  const params = new URLSearchParams();
  if (data.subject) {
    params.append('subject', data.subject);
  }
  if (data.body) {
    params.append('body', data.body);
  }
  if (params.toString()) {
    emailString += `?${params.toString()}`;
  }
  return emailString;
}

export function formatSmsString(data: SmsQrInput): string {
  let smsString = `SMSTO:${data.phoneNumber}`;
  if (data.message) {
    smsString += `:${data.message}`;
  }
  return smsString;
}

export function formatVCardString(data: VCardQrInput): string {
  let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
  vcard += `N:${data.lastName};${data.firstName}\n`;
  vcard += `FN:${data.firstName} ${data.lastName}\n`;
  if (data.organization) vcard += `ORG:${data.organization}\n`;
  if (data.title) vcard += `TITLE:${data.title}\n`;
  if (data.phoneNumber) vcard += `TEL;TYPE=WORK,VOICE:${data.phoneNumber}\n`;
  if (data.email) vcard += `EMAIL:${data.email}\n`;
  if (data.website) vcard += `URL:${data.website}\n`;
  
  let adrParts = [];
  if (data.street) adrParts.push(data.street); else adrParts.push('');
  if (data.city) adrParts.push(data.city);  else adrParts.push('');
  if (data.state) adrParts.push(data.state); else adrParts.push('');
  if (data.zip) adrParts.push(data.zip); else adrParts.push('');
  if (data.country) adrParts.push(data.country); else adrParts.push('');
  
  if (adrParts.some(part => part !== '')) {
    vcard += `ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}\n`;
  }
  
  vcard += "END:VCARD";
  return vcard;
}

export function generateQrValue(type: string | null, details: any): string {
  if (!type || !details) return "https://example.com";

  switch (type) {
    case 'url':
      return details.url || "https://example.com";
    case 'text':
      return details.text || "Hello World";
    case 'wifi':
      return formatWifiString(details as WifiQrInput);
    case 'email':
      return formatEmailString(details as EmailQrInput);
    case 'sms':
      return formatSmsString(details as SmsQrInput);
    case 'vcard':
      return formatVCardString(details as VCardQrInput);
    default:
      return "https://example.com";
  }
}
