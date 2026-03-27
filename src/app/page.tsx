'use client';

import Link from 'next/link';
import { BrainCircuit, ShieldCheck, Target, Award, ArrowRight, Activity, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useTranslation } from '@/context/language-provider';
import { useTherapistAccess } from '@/hooks/use-therapist-access';
import { useUser } from '@/firebase';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { hasTherapistAccess } = useTherapistAccess();

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-[#D4AF37]" />,
      title: t('landing.feature1Title'),
      description: t('landing.feature1Description'),
    },
    {
      icon: <Award className="h-8 w-8 text-[#D4AF37]" />,
      title: t('landing.feature2Title'),
      description: t('landing.feature2Description'),
    },
    {
      icon: <Target className="h-8 w-8 text-[#D4AF37]" />,
      title: t('landing.feature3Title'),
      description: t('landing.feature3Description'),
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-[#D4AF37]" />,
      title: t('landing.feature4Title'),
      description: t('landing.feature4Description'),
    },
  ];

  const highlights = [
    {
      icon: <Activity className="h-5 w-5 text-[#D4AF37]" />,
      title: t('landing.highlight1Title'),
      description: t('landing.highlight1Description'),
    },
    {
      icon: <FileText className="h-5 w-5 text-[#D4AF37]" />,
      title: t('landing.highlight2Title'),
      description: t('landing.highlight2Description'),
    },
    {
      icon: <Users className="h-5 w-5 text-[#D4AF37]" />,
      title: t('landing.highlight3Title'),
      description: t('landing.highlight3Description'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#FFFFFF,#F7F9FC,#EEF2F7)] text-[#0F172A]">
      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[#E6C768]/30 bg-white/85 px-4 backdrop-blur-sm lg:px-6">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Logo />
          <span className="sr-only">NeuroQuest</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {hasTherapistAccess && (
            <Link
              href="/therapist"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              {t('landing.therapistPortal')}
            </Link>
          )}
          <Button asChild className="border-0 bg-[#D4AF37] text-white hover:bg-[#C49B2C]">
            <Link href={user ? "/dashboard" : "/login"}>{t('landing.launchApp')}</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-14 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <div className="space-y-6">
                <div className="inline-flex w-fit items-center rounded-full border border-[#E6C768]/50 bg-[#FFF3C4] px-4 py-1 text-sm font-medium text-[#1B2A41]">
                  {t('landing.badge')}
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl xl:text-6xl/none font-headline">
                    {t('landing.headline')}
                  </h1>
                  <p className="max-w-[680px] text-lg leading-8 text-[#4B5563] md:text-xl">
                    {t('landing.subheadline')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button size="lg" asChild className="border-0 bg-[#D4AF37] text-white hover:bg-[#C49B2C]">
                    <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
                      {t('startYourJourney')} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-[#1B2A41] bg-white text-[#1B2A41] hover:bg-[#F7F9FC]"
                  >
                    <Link href={hasTherapistAccess ? "/therapist" : (user ? "/dashboard" : "/login")}>
                      {t('landing.secondaryCta')}
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-4 pt-2 sm:grid-cols-3">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight.title}
                      className="rounded-2xl border border-[#E6C768]/35 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                    >
                      <div className="mb-3 inline-flex rounded-full bg-[#FFF3C4] p-2">
                        {highlight.icon}
                      </div>
                      <p className="text-sm font-semibold text-[#1B2A41]">{highlight.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#6B7280]">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,#FFF3C4,transparent_55%)]" />
                <div className="overflow-hidden rounded-[2rem] border border-[#E6C768]/40 bg-[#1B2A41] p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/95 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.2)]">
                      <Logo className="h-24 w-24" />
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-[#F2D16B]">
                      {t('landing.panelBadge')}
                    </div>
                  </div>
                  <div className="mt-8 space-y-4">
                    <h2 className="text-2xl font-semibold text-white">{t('landing.panelTitle')}</h2>
                    <p className="text-sm leading-7 text-white/75">{t('landing.panelDescription')}</p>
                  </div>
                  <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{t('landing.panelMetric1Label')}</span>
                        <span className="text-lg font-semibold text-[#F2D16B]">{t('landing.panelMetric1Value')}</span>
                      </div>
                      <p className="mt-2 text-sm text-white/65">{t('landing.panelMetric1Description')}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{t('landing.panelMetric2Label')}</span>
                        <span className="text-lg font-semibold text-[#F2D16B]">{t('landing.panelMetric2Value')}</span>
                      </div>
                      <p className="mt-2 text-sm text-white/65">{t('landing.panelMetric2Description')}</p>
                    </div>
                    <div className="rounded-2xl border border-[#E6C768]/20 bg-[#FFF3C4] p-4 text-[#1B2A41]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8962E]">
                        {t('landing.panelFooterLabel')}
                      </p>
                      <p className="mt-2 text-sm leading-6">{t('landing.panelFooterDescription')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-full border border-[#E6C768]/40 bg-white px-4 py-1 text-sm text-[#1B2A41] shadow-sm">
                  {t('landing.keyFeatures')}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter text-[#0F172A] sm:text-5xl font-headline">
                  {t('landing.approachTitle')}
                </h2>
                <p className="max-w-[900px] text-[#4B5563] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('landing.approachDescription')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="h-full border-[#E6C768]/30 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-headline text-[#1B2A41]">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#6B7280]">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-[#E6C768]/25 bg-white/80 px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-[#6B7280]">{t('landing.footerRights')}</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <p className="text-xs text-[#6B7280]">{t('landing.footerDisclaimer')}</p>
        </nav>
      </footer>
    </div>
  );
}

    
