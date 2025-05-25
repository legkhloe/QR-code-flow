
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Palette, ScanQrCode, Sparkles, Paintbrush } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { appName } from '@/lib/config';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-slate-950 to-black">
      <section className="text-center py-16 md:py-24 lg:py-32">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
          Welcome to <span className="text-primary">{appName}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
          Effortlessly create, customize, and manage your QR codes with powerful tools and AI-driven insights.
          Your gateway to seamless digital interaction.
        </p>
        <div className="space-x-4">
          <Link href="/create" passHref legacyBehavior>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started
            </Button>
          </Link>
          <Link href="#features" passHref legacyBehavior>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      <section id="features" className="w-full max-w-5xl py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <ScanQrCode className="w-6 h-6" />
              </div>
              <CardTitle>Easy QR Code Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Step-by-step wizard to create QR codes for URLs, WiFi, vCards, and more.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <Paintbrush className="w-6 h-6" />
              </div>
              <CardTitle>Advanced Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Personalize your QR codes with custom colors, sizes, and error correction levels.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle>AI-Powered Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get intelligent suggestions for QR code content in our advanced editor.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="w-full max-w-5xl py-16 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="md:w-1/2">
            <Image 
                src="https://placehold.co/600x400.png" 
                alt="QR Code example" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-xl"
                data-ai-hint="qr code technology"
            />
        </div>
        <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose {appName}?</h2>
            <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span><strong>User-Friendly Wizard:</strong> Designed for simplicity, making QR code creation a breeze for everyone.</span>
                </li>
                <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span><strong>High-Quality Downloads:</strong> Get your QR codes in PNG, JPEG, or SVG formats, perfect for print or digital use.</span>
                </li>
                <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span><strong>Flexible Customization:</strong> Start with basic options and move to an advanced editor for more control.</span>
                </li>
            </ul>
        </div>
      </section>

      <section className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Forge Your QR Codes?</h2>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
          Jump into our creation wizard and start making amazing QR codes with {appName}!
        </p>
        <Link href="/create" passHref legacyBehavior>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Create Your QR Code
          </Button>
        </Link>
      </section>
    </div>
  );
}
