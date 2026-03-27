'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { LanguageProvider, useTranslation } from '@/context/language-provider';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


function AppBody({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();
  const title =
    locale === 'es'
      ? 'NeuroQuest | Seguimiento mental con enfoque clínico'
      : 'NeuroQuest | Mental health follow-up with clinical structure';
  const description =
    locale === 'es'
      ? 'Plataforma digital de seguimiento mental con check-in clínico, observer, progreso longitudinal, soporte de crisis y portal para terapeutas.'
      : 'A digital mental-health follow-up platform with clinical check-ins, observer workflows, longitudinal progress, crisis support, and a therapist portal.';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
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
    <FirebaseClientProvider>
      <LanguageProvider>
        <AppBody>
          {children}
        </AppBody>
      </LanguageProvider>
    </FirebaseClientProvider>
  );
}

    
