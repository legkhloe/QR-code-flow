
import AuthForm from '@/components/auth/AuthForm';
import { appName } from '@/lib/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Login | ${appName}`,
  description: `Login to ${appName}.`,
};

export default function AuthPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-12">
      <AuthForm />
    </div>
  );
}
