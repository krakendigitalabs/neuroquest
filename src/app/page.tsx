'use client';

import Link from 'next/link';
import { BrainCircuit, ShieldCheck, Target, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/language-provider';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@/firebase';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isAdmin } = useAdmin();

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: t('landing.feature1Title'),
      description: t('landing.feature1Description'),
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: t('landing.feature2Title'),
      description: t('landing.feature2Description'),
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: t('landing.feature3Title'),
      description: t('landing.feature3Description'),
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: t('landing.feature4Title'),
      description: t('landing.feature4Description'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo />
          <span className="sr-only">NeuroQuest</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {isAdmin && (
            <Link
              href="/therapist"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              {t('landing.therapistPortal')}
            </Link>
          )}
          <Button asChild>
            <Link href={user ? "/dashboard" : "/login"}>{t('landing.launchApp')}</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    {t('landing.headline')}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t('landing.subheadline')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
                      {t('startYourJourney')} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <div className="w-full max-w-md p-8 bg-background rounded-2xl shadow-2xl flex items-center justify-center">
                    <Logo className="w-48 h-48 text-primary" />
                 </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">{t('landing.keyFeatures')}</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{t('landing.approachTitle')}</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('landing.approachDescription')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="h-full transform transition-transform hover:scale-105 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">{t('landing.footerRights')}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <p className="text-xs text-muted-foreground">{t('landing.footerDisclaimer')}</p>
        </nav>
      </footer>
    </div>
  );
}

    