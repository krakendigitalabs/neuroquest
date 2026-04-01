'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <link
          rel="icon"
          href="https://res.cloudinary.com/dr50ioh9h/image/upload/v1774648742/simbolo_nq_okc053.png?v=20260327"
          type="image/png"
        />
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
        <Analytics />
        <SpeedInsights />
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

    
