
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
  type QrType,
  UrlQrSchema, type UrlQrInput,
  TextQrSchema, type TextQrInput,
  WifiQrSchema, type WifiQrInput,
  EmailQrSchema, type EmailQrInput,
  SmsQrSchema, type SmsQrInput,
  VCardQrSchema, type VCardQrInput,
} from '@/lib/schemas';

interface QrDetailFormProps {
  type: QrType;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const getSchema = (type: QrType) => {
  switch (type) {
    case 'url': return UrlQrSchema;
    case 'text': return TextQrSchema;
    case 'wifi': return WifiQrSchema;
    case 'email': return EmailQrSchema;
    case 'sms': return SmsQrSchema;
    case 'vcard': return VCardQrSchema;
    default: throw new Error('Invalid QR type');
  }
};

export default function QrDetailForm({ type, onSubmit, onBack }: QrDetailFormProps) {
  const form = useForm({
    resolver: zodResolver(getSchema(type)),
    defaultValues: (() => {
      switch (type) {
        case 'url': return { url: '' };
        case 'text': return { text: '' };
        case 'wifi': return { ssid: '', password: '', encryption: 'WPA', hidden: false };
        case 'email': return { email: '', subject: '', body: '' };
        case 'sms': return { phoneNumber: '', message: '' };
        case 'vcard': return { firstName: '', lastName: '', phoneNumber: '', email: '', organization: '', title: '', website: '', street: '', city: '', state: '', zip: '', country: '' };
        default: return {};
      }
    })(),
  });

  const renderFormFields = () => {
    switch (type) {
      case 'url':
        return (
          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        );
      case 'text':
        return (
          <FormField control={form.control} name="text" render={({ field }) => (
            <FormItem>
              <FormLabel>Text Content</FormLabel>
              <FormControl><Textarea placeholder="Enter your text here" {...field} rows={4} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        );
      case 'wifi':
        return (<>
          <FormField control={form.control} name="ssid" render={({ field }) => (
            <FormItem>
              <FormLabel>Network Name (SSID)</FormLabel>
              <FormControl><Input placeholder="MyNetw0rk" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password (optional)</FormLabel>
              <FormControl><Input type="password" placeholder="s3crEtp@sswOrd" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="encryption" render={({ field }) => (
            <FormItem>
              <FormLabel>Encryption</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select encryption type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Encryption</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="hidden" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Hidden Network?</FormLabel>
                <FormDescription>Check if this Wi-Fi network is hidden (does not broadcast its SSID).</FormDescription>
              </div>
            </FormItem>
          )} />
        </>);
      case 'email':
        return (<>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="recipient@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="subject" render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (optional)</FormLabel>
              <FormControl><Input placeholder="Meeting Request" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="body" render={({ field }) => (
            <FormItem>
              <FormLabel>Body (optional)</FormLabel>
              <FormControl><Textarea placeholder="Hello, let's connect." {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>);
      case 'sms':
        return (<>
          <FormField control={form.control} name="phoneNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input type="tel" placeholder="+12345678900" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optional)</FormLabel>
              <FormControl><Textarea placeholder="Check out this cool app!" {...field} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>);
      case 'vcard':
        return (<>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="phoneNumber" render={({ field }) => (
            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+15551234567" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="organization" render={({ field }) => (
              <FormItem><FormLabel>Organization</FormLabel><FormControl><Input placeholder="Acme Corp" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title/Job</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://johndoe.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="street" render={({ field }) => (
            <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="state" render={({ field }) => (
              <FormItem><FormLabel>State/Province</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="zip" render={({ field }) => (
              <FormItem><FormLabel>ZIP/Postal Code</FormLabel><FormControl><Input placeholder="90210" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </>);
      default:
        return <p>Form not available for this type.</p>;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {renderFormFields()}
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit">
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
