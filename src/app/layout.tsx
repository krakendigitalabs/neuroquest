'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { LanguageProvider, useTranslation } from '@/context/language-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


function AppBody({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <title>NeuroQuest - Your Gamified Mental Wellness Journey</title>
        <meta name="description" content="Transform your mental wellness journey into a gamified adventure. Conquer OCD and anxiety with NeuroQuest." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <AppBody>
        {children}
      </AppBody>
    </LanguageProvider>
  );
}
