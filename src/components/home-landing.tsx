'use client';

import { useMemo, useState, type ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartHandshake, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/context/language-provider';
import { useTherapistAccess } from '@/hooks/use-therapist-access';
import { useUser } from '@/firebase';
import { BRAND_SYMBOL } from '@/components/home/brand';
import { HeroNeuralCanvas } from '@/components/home/hero-neural-canvas';
import { audienceIcons, getModuleIcon, ShieldCheck, whyIcons } from '@/components/home/landing-icons';
import { LanguageSwitcher } from '@/components/language-switcher';

type LandingCopy = Record<string, any>;

export function HomeLanding() {
  const { t, tm } = useTranslation();
  const { user } = useUser();
  const { hasTherapistAccess } = useTherapistAccess();
  const copy = tm<LandingCopy>('landing');
  const systemHref = user ? '/dashboard' : '/login';

  const modules = copy?.modules?.cards ?? [];
  const journeySteps = copy?.journey?.steps ?? [];
  const proofStats = copy?.proof?.stats ?? [];
  const whyCards = copy?.why?.cards ?? [];
  const audiencePatientItems = copy?.audiences?.patientItems ?? [];
  const audienceTherapistItems = copy?.audiences?.therapistItems ?? [];

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(0);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');

  const donationLink = 'https://checkout.wompi.co/method';
  const canDonate = donorName.trim() && donorEmail.trim() && donorPhone.trim();
  const activeModule = modules[activeModuleIndex] ?? modules[0] ?? ['', '', ''];
  const activeJourney = journeySteps[activeJourneyIndex] ?? journeySteps[0];

  const donationSummary = useMemo(
    () => `${donorName.trim()} | ${donorEmail.trim()} | ${donorPhone.trim()}`,
    [donorEmail, donorName, donorPhone],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(242,209,107,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(27,42,65,0.1),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,#F7F9FC_42%,#EEF2F7_100%)] text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl">
        <div className="container flex h-20 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" prefetch={false}>
            <div className="clinical-glass-soft flex h-12 w-12 items-center justify-center rounded-2xl">
              <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={32} height={32} className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-[#1B2A41]">{t('appName')}</p>
              <p className="text-xs text-[#6B7280]">{copy?.brand?.tagline}</p>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            <a href="#como-funciona" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">
              {copy?.nav?.howItWorks}
            </a>
            <a href="#modulos" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">
              {copy?.nav?.modules}
            </a>
            <a href="#base-clinica" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">
              {copy?.nav?.science}
            </a>
            {hasTherapistAccess ? (
              <Link href="/therapist" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">
                {copy?.nav?.therapist}
              </Link>
            ) : null}
          </nav>

          <LanguageSwitcher className="ml-auto lg:ml-6" compact />
          <Button asChild className="ml-2 border-0 bg-[#D4AF37] text-white shadow-[0_12px_30px_rgba(212,175,55,0.28)] hover:bg-[#C49B2C]">
            <Link href={systemHref}>Comenzar tu viaje</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-10 md:py-20 lg:py-24">
          <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit border-[#E6C768]/40 bg-[#FFF7DA]/92 px-4 py-2 text-sm text-[#1B2A41]">
                {copy?.hero?.badge}
              </Badge>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-5xl xl:text-6xl">
                {copy?.hero?.title}
              </h1>
              <p className="max-w-[760px] text-lg leading-8 text-[#4B5563]">{copy?.hero?.description}</p>

              <div className="grid gap-3 pt-1">
                {(copy?.hero?.trustPoints ?? []).map((item: string) => (
                  <div key={item} className="clinical-glass-soft flex items-start gap-3 rounded-2xl px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
                    <p className="text-sm leading-6 text-[#3A4A63]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px]">
              <HeroNeuralCanvas />
              <div className="relative z-10 p-4 md:p-7">
                <div className="clinical-glass rounded-[1.6rem] p-4 md:p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#B8962E]">{copy?.hero?.productViewEyebrow}</p>
                  <p className="mt-2 text-xl font-semibold text-[#1B2A41] md:text-2xl">{copy?.hero?.productViewTitle}</p>
                  <Tabs defaultValue="dashboard" className="mt-5">
                    <TabsList className="grid h-auto grid-cols-1 rounded-2xl border border-white/55 bg-white/45 p-1 text-[#3A4A63] backdrop-blur-xl sm:grid-cols-3">
                      {(copy?.hero?.previewTabs ?? []).map((tab: any) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-3 py-3 text-sm data-[state=active]:bg-[#1B2A41] data-[state=active]:text-white">
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {(copy?.hero?.previewTabs ?? []).map((tab: any) => (
                      <TabsContent key={tab.value} value={tab.value} className="mt-4">
                        <div className="rounded-2xl border border-white/60 bg-white/75 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-[#B8962E]">{tab.badge}</p>
                          <h3 className="mt-2 text-lg font-semibold text-[#1B2A41]">{tab.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-[#4B5563]">{tab.body}</p>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <Badge variant="outline" className="border-[#E6C768]/40 bg-[#FFF7DA] px-4 py-2 text-sm text-[#1B2A41]">{copy?.proof?.badge}</Badge>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">{copy?.proof?.title}</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {proofStats.map((stat: [string, string, string]) => (
                    <div key={stat[1]} className="rounded-[1.5rem] border border-[#E6C768]/18 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                      <p className="text-4xl font-semibold tracking-tight text-[#1B2A41]">{stat[0]}</p>
                      <p className="mt-2 text-sm font-medium text-[#B8962E]">{stat[1]}</p>
                      <p className="mt-3 text-sm leading-7 text-[#5B6474]">{stat[2]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy?.why?.badge}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy?.why?.title}</h2>
              <p className="mt-5 text-lg leading-8 text-[#4B5563]">{copy?.why?.description}</p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {whyCards.map((card: any, index: number) => {
                const Icon = whyIcons[index];
                return (
                  <Card key={card.title} className="rounded-[1.7rem] border border-white/80 bg-white/74 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3C4]">
                        <Icon className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <CardTitle className="pt-3 text-2xl text-[#1B2A41]">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-[#5B6474]">{card.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="modulos" className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy?.modules?.badge}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy?.modules?.title}</h2>
              <p className="mt-5 text-lg leading-8 text-[#4B5563]">{copy?.modules?.description}</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {modules.map((module: [string, string, string], index: number) => {
                  const Icon = getModuleIcon(module[0]);
                  const isActive = index === activeModuleIndex;
                  return (
                    <button
                      key={module[1]}
                      type="button"
                      onMouseEnter={() => setActiveModuleIndex(index)}
                      onFocus={() => setActiveModuleIndex(index)}
                      onClick={() => setActiveModuleIndex(index)}
                      className={`rounded-[1.5rem] border p-5 text-left transition ${
                        isActive
                          ? 'border-[#D4AF37]/60 bg-[#FFF9E8] shadow-[0_16px_35px_rgba(212,175,55,0.2)]'
                          : 'border-white/80 bg-white/74 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]'
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3C4]">
                        <Icon className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <p className="mt-3 text-lg font-semibold text-[#1B2A41]">{module[1]}</p>
                      <p className="mt-2 text-sm text-[#5B6474]">{module[2]}</p>
                    </button>
                  );
                })}
              </div>

              <Card className="rounded-[1.8rem] border-[#E6C768]/30 bg-[linear-gradient(145deg,#1B2A41,#0F172A)] text-white">
                <CardHeader>
                  <Badge className="w-fit border-0 bg-white/10 text-[#F2D16B] hover:bg-white/10">Vista interactiva</Badge>
                  <CardTitle className="text-2xl">{activeModule[1]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-7 text-white/80">{activeModule[2]}</p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#F2D16B]">Estado premium</p>
                    <p className="mt-2 text-sm text-white/80">
                      Esta capacidad escala con rutas avanzadas y experiencia más guiada según rol y validación clínica.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-12 md:py-16">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-5">
              <Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy?.journey?.badge}</Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy?.journey?.title}</h2>
            </div>

            <div className="grid gap-4">
              {journeySteps.map((step: any, index: number) => (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => setActiveJourneyIndex(index)}
                  className={`rounded-[1.6rem] border p-5 text-left transition ${
                    activeJourneyIndex === index
                      ? 'border-[#D4AF37]/50 bg-[#FFF9E8] shadow-[0_14px_34px_rgba(212,175,55,0.2)]'
                      : 'border-white/80 bg-white/74 hover:border-[#E6C768]/40 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B2A41] text-sm font-semibold text-[#F2D16B]">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-[#1B2A41]">{step.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#5B6474]">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}

              {activeJourney ? (
                <div className="rounded-[1.6rem] border border-[#E6C768]/30 bg-[#0F172A] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">Paso activo</p>
                  <p className="mt-2 text-lg font-semibold">{activeJourney.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/78">{activeJourney.description}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="rounded-[2rem] border border-[#E6C768]/24 bg-[#0F172A] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] md:px-8 md:py-10">
              <div className="max-w-3xl">
                <Badge className="border-white/12 bg-white/10 px-4 py-2 text-sm text-[#F2D16B] hover:bg-white/10">{copy?.audiences?.badge}</Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{copy?.audiences?.title}</h2>
              </div>
              <Tabs defaultValue="patients" className="mt-8">
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-white/8 p-1 md:w-fit">
                  <TabsTrigger value="patients" className="rounded-xl px-5 py-3 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">
                    {copy?.audiences?.patientTitle}
                  </TabsTrigger>
                  <TabsTrigger value="therapists" className="rounded-xl px-5 py-3 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">
                    {copy?.audiences?.therapistTitle}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="patients" className="mt-6">
                  <AudiencePanel
                    icon={audienceIcons.patients}
                    title={copy?.audiences?.patientTitle}
                    intro={copy?.audiences?.patientIntro}
                    items={audiencePatientItems}
                  />
                </TabsContent>
                <TabsContent value="therapists" className="mt-6">
                  <AudiencePanel
                    icon={audienceIcons.therapists}
                    title={copy?.audiences?.therapistTitle}
                    intro={copy?.audiences?.therapistIntro}
                    items={audienceTherapistItems}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy?.activation?.badge}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy?.activation?.title}</h2>
              <p className="mt-5 text-lg leading-8 text-[#4B5563]">{copy?.activation?.description}</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {(copy?.activation?.cards ?? []).map((card: any) => (
                <Card key={card.role} className="rounded-[1.75rem] border border-white/80 bg-white/76">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#1B2A41]">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-7 text-[#5B6474]">{card.description}</p>
                    <div className="rounded-2xl border border-[#E6C768]/20 bg-[#FFF9E8] px-4 py-3 text-sm text-[#3A4A63]">
                      {card.helper}
                    </div>
                    <Badge className="border-0 bg-[#1B2A41]/10 text-[#1B2A41] hover:bg-[#1B2A41]/10">Ruta premium disponible</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="base-clinica" className="py-12 md:py-16">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy?.science?.badge}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy?.science?.title}</h2>
              <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#4B5563]">{copy?.science?.description}</p>
              <div className="mt-8 grid gap-5">
                {(copy?.science?.pillars ?? []).map((pillar: [string, string]) => (
                  <div key={pillar[0]} className="rounded-[1.5rem] border border-white/80 bg-white/74 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                    <h3 className="text-xl font-semibold text-[#1B2A41]">{pillar[0]}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5B6474]">{pillar[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#E6C768]/26 bg-[linear-gradient(180deg,#1B2A41,#0F172A)] p-7 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <TriangleAlert className="h-5 w-5 text-[#F2D16B]" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[#F2D16B]">{copy?.science?.safetyTitle}</p>
                  <p className="mt-1 text-sm text-white/60">{copy?.science?.safetyIntro}</p>
                </div>
              </div>
              <div className="mt-7 grid gap-4">
                {(copy?.science?.safetyItems ?? []).map((item: string) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F2D16B]" />
                      <p className="text-sm leading-7 text-white/78">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="rounded-[2.25rem] border border-[#E6C768]/26 bg-[radial-gradient(circle_at_top,rgba(242,209,107,0.18),transparent_34%),linear-gradient(135deg,#1B2A41,#0F172A)] px-6 py-10 text-white">
              <Badge className="border-white/12 bg-white/10 px-4 py-2 text-sm text-[#F2D16B] hover:bg-white/10">{copy?.finalCta?.badge}</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{copy?.finalCta?.title}</h2>
              <p className="mt-5 max-w-[820px] text-lg leading-8 text-white/74">{copy?.finalCta?.description}</p>
              <p className="mt-6 text-sm text-[#F2D16B]">Para ingresar al sistema usa el botón superior “Comenzar tu viaje”.</p>
            </div>
          </div>
        </section>

        <section className="pb-14 md:pb-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 rounded-[2.25rem] border border-[#E6C768]/18 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <Badge variant="outline" className="border-[#E6C768]/40 bg-[#FFF7DA] px-4 py-2 text-sm text-[#1B2A41]">{copy?.donation?.badge}</Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">{copy?.donation?.title}</h2>
                <p className="mt-5 max-w-[640px] text-lg leading-8 text-[#4B5563]">{copy?.donation?.description}</p>
                <div className="mt-6 inline-flex items-center gap-3 rounded-[1.25rem] border border-[#E6C768]/22 bg-[#FFF9E8] px-4 py-3 text-sm text-[#3A4A63]">
                  <HeartHandshake className="h-5 w-5 text-[#D4AF37]" />
                  <span>{copy?.donation?.helper}</span>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,#FFFFFF,#F7F9FC)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B8962E]">{copy?.donation?.formTitle}</p>
                <div className="mt-6 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="donor-name" className="text-[#1B2A41]">{copy?.donation?.fields?.name}</Label>
                    <Input id="donor-name" value={donorName} onChange={(event) => setDonorName(event.target.value)} className="h-12 rounded-xl border-[#1B2A41]/10 bg-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="donor-email" className="text-[#1B2A41]">{copy?.donation?.fields?.email}</Label>
                    <Input id="donor-email" type="email" value={donorEmail} onChange={(event) => setDonorEmail(event.target.value)} className="h-12 rounded-xl border-[#1B2A41]/10 bg-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="donor-phone" className="text-[#1B2A41]">{copy?.donation?.fields?.phone}</Label>
                    <Input id="donor-phone" type="tel" value={donorPhone} onChange={(event) => setDonorPhone(event.target.value)} className="h-12 rounded-xl border-[#1B2A41]/10 bg-white" />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    size="lg"
                    asChild={Boolean(canDonate)}
                    disabled={!canDonate}
                    className="border-0 bg-[#D4AF37] text-white shadow-[0_14px_30px_rgba(212,175,55,0.24)] hover:bg-[#C49B2C] disabled:cursor-not-allowed disabled:bg-[#D4AF37]/50"
                  >
                    {canDonate ? (
                      <a
                        href={donationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2"
                        aria-label={`${copy?.donation?.cta} ${donationSummary}`}
                      >
                        {copy?.donation?.cta}
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-2">{copy?.donation?.cta}</span>
                    )}
                  </Button>
                  <a href={donationLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#1B2A41] underline decoration-[#D4AF37] underline-offset-4 transition hover:text-[#B8962E]">
                    {copy?.donation?.linkLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/80 py-10 backdrop-blur-xl">
        <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-[1.1fr_0.75fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E6C768]/35 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
                <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#1B2A41]">{t('appName')}</p>
                <p className="text-xs text-[#6B7280]">{copy?.brand?.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-[460px] text-sm leading-7 text-[#5B6474]">{copy?.footer?.productDescription}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1B2A41]">{copy?.footer?.linksTitle}</p>
            <div className="mt-4 grid gap-2">
              <a href="#como-funciona" className="text-sm text-[#5B6474] transition hover:text-[#1B2A41]">{copy?.footer?.links?.[0]}</a>
              <a href="#modulos" className="text-sm text-[#5B6474] transition hover:text-[#1B2A41]">{copy?.footer?.links?.[1]}</a>
              <a href="#base-clinica" className="text-sm text-[#5B6474] transition hover:text-[#1B2A41]">{copy?.footer?.links?.[2]}</a>
              <a href={hasTherapistAccess ? '/therapist' : '/login'} className="text-sm text-[#5B6474] transition hover:text-[#1B2A41]">{copy?.footer?.links?.[3]}</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1B2A41]">{copy?.footer?.safetyTitle}</p>
            <p className="mt-4 text-sm leading-7 text-[#5B6474]">{copy?.footer?.safetyDescription}</p>
          </div>
        </div>
        <div className="container mt-8 flex flex-col gap-3 border-t border-[#E6C768]/20 px-4 pt-6 text-sm text-[#6B7280] md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p>
            {copy?.footer?.rightsPrefix}{' '}
            <a href="https://krakendigitalabs.com" target="_blank" rel="noreferrer" className="font-medium text-[#1B2A41] underline decoration-[#D4AF37] underline-offset-4 transition hover:text-[#D4AF37]">
              {copy?.footer?.ownerName}
            </a>
            .
          </p>
          <p>{copy?.footer?.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}

function AudiencePanel({
  icon: Icon,
  title,
  intro,
  items,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  intro: string;
  items: string[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-6 w-6 text-[#F2D16B]" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/72">{intro}</p>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-5 transition hover:bg-white/10">
            <div className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
              <p className="text-sm leading-7 text-white/78">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
