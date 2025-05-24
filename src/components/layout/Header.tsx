"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Home } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { appName } from '@/lib/config';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">{appName}</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Link href="/" legacyBehavior passHref>
            <Button variant="ghost" className="text-sm font-medium">
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </Link>
          <Link href="/dashboard" legacyBehavior passHref>
            <Button variant="ghost" className="text-sm font-medium">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
