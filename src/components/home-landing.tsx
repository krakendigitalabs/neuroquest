'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, ShieldPlus, Sparkles, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/context/language-provider';
import { useTherapistAccess } from '@/hooks/use-therapist-access';
import { useUser } from '@/firebase';
import { BRAND_SYMBOL, getLandingCopy } from '@/components/home/landing-copy';
import { HeroNeuralCanvas } from '@/components/home/hero-neural-canvas';
import { audienceIcons, getModuleIcon, ShieldCheck, whyIcons } from '@/components/home/landing-icons';

export function HomeLanding() {
  const { locale } = useTranslation();
  const { user } = useUser();
  const { hasTherapistAccess } = useTherapistAccess();
  const copy = getLandingCopy(locale);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(242,209,107,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(27,42,65,0.1),transparent_28%),linear-gradient(180deg,#FFFFFF_0%,#F7F9FC_42%,#EEF2F7_100%)] text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl">
        <div className="container flex h-20 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3" prefetch={false}>
            <div className="clinical-glass-soft flex h-12 w-12 items-center justify-center rounded-2xl">
              <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={32} height={32} className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-[#1B2A41]">NeuroQuest</p>
              <p className="text-xs text-[#6B7280]">Health-tech / mental health SaaS</p>
            </div>
          </Link>
          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            <a href="#como-funciona" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">{copy.nav.howItWorks}</a>
            <a href="#modulos" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">{copy.nav.modules}</a>
            <a href="#base-clinica" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">{copy.nav.science}</a>
            {hasTherapistAccess && <Link href="/therapist" className="text-sm font-medium text-[#3A4A63] transition hover:text-[#1B2A41]">{copy.nav.therapist}</Link>}
          </nav>
          <Button asChild className="ml-4 border-0 bg-[#D4AF37] text-white shadow-[0_12px_30px_rgba(212,175,55,0.28)] hover:bg-[#C49B2C]">
            <Link href={user ? '/dashboard' : '/login'}>{copy.nav.cta}</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-28">
          <div className="container grid gap-14 px-4 md:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-8">
              <Badge className="animate-fade-up w-fit border-[#E6C768]/40 bg-[#FFF7DA]/92 px-4 py-2 text-sm text-[#1B2A41] shadow-[0_12px_24px_rgba(212,175,55,0.12)] hover:bg-[#FFF7DA]">{copy.hero.badge}</Badge>
              <div className="space-y-5">
                <div className="animate-fade-up-delay-1 flex items-center gap-4">
                  <div className="clinical-glass hidden rounded-[1.5rem] p-4 sm:flex">
                    <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={52} height={52} className="h-12 w-12 object-contain" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#B8962E]">NeuroQuest</p>
                </div>
                <h1 className="animate-fade-up-delay-2 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#0F172A] sm:text-5xl xl:text-6xl">{copy.hero.title}</h1>
                <p className="animate-fade-up-delay-3 max-w-[780px] text-lg leading-8 text-[#4B5563] md:text-xl">{copy.hero.description}</p>
              </div>
              <div className="animate-fade-up-delay-3 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="border-0 bg-[#D4AF37] text-white shadow-[0_14px_32px_rgba(212,175,55,0.28)] hover:bg-[#C49B2C]">
                  <Link href={user ? '/dashboard' : '/login'} className="flex items-center gap-2">{copy.hero.primaryCta} <ArrowRight className="h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-[#1B2A41]/12 bg-white/80 text-[#1B2A41] backdrop-blur-xl hover:bg-[#F7F9FC]">
                  <a href="#como-funciona">{copy.hero.secondaryCta}</a>
                </Button>
              </div>
              <div className="animate-fade-up-delay-3 grid gap-3 pt-2">
                {copy.hero.trustPoints.map((item: string) => (
                  <div key={item} className="clinical-glass-soft flex items-start gap-3 rounded-2xl px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
                    <p className="text-sm leading-6 text-[#3A4A63]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up-delay-2 min-h-[680px]">
              <div className="animate-soft-float absolute -left-10 top-10 h-52 w-52 rounded-full bg-[#FFF3C4]/70 blur-3xl" />
              <div className="absolute -right-12 top-8 h-56 w-56 rounded-full bg-[#1B2A41]/10 blur-3xl" />
              <HeroNeuralCanvas />
              <div className="relative z-10 flex h-full flex-col justify-between gap-5 px-4 py-4 md:px-7 md:py-7">
                <div className="grid gap-4 md:grid-cols-[0.64fr_0.36fr]">
                  <div className="clinical-glass animate-breathe rounded-[2rem] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[#B8962E]">{locale === 'es' ? 'Vista inmersiva del producto' : 'Immersive product view'}</p>
                        <p className="mt-2 text-2xl font-semibold text-[#1B2A41]">NeuroQuest MVP</p>
                      </div>
                      <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" /><span className="h-2.5 w-2.5 rounded-full bg-[#1B2A41]/18" /><span className="h-2.5 w-2.5 rounded-full bg-[#1B2A41]/10" /></div>
                    </div>
                    <Tabs defaultValue="dashboard" className="mt-6">
                      <TabsList className="grid h-auto grid-cols-3 rounded-2xl border border-white/55 bg-white/45 p-1 text-[#3A4A63] backdrop-blur-xl">
                        {copy.hero.previewTabs.map((tab: any) => <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-3 text-sm data-[state=active]:bg-[#1B2A41] data-[state=active]:text-white">{tab.label}</TabsTrigger>)}
                      </TabsList>
                      {copy.hero.previewTabs.map((tab: any) => (
                        <TabsContent key={tab.value} value={tab.value} className="mt-5">
                          <div className="rounded-[1.75rem] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(247,249,252,0.62))] p-5 backdrop-blur-2xl">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-[#B8962E]">{tab.badge}</p>
                                <h3 className="mt-2 text-2xl font-semibold text-[#1B2A41]">{tab.title}</h3>
                              </div>
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/65 bg-white/75">
                                <Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={28} height={28} className="h-7 w-7 object-contain" />
                              </div>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-[#4B5563]">{tab.body}</p>
                            <div className="mt-5 flex flex-wrap gap-2">{tab.chips.map((chip: string) => <span key={chip} className="rounded-full border border-[#1B2A41]/10 bg-white/80 px-3 py-1 text-xs text-[#3A4A63]">{chip}</span>)}</div>
                            <div className="mt-6 grid gap-3">
                              {tab.metrics.map((metric: any) => (
                                <div key={metric.label} className="rounded-2xl border border-white/60 bg-white/72 p-4">
                                  <div className="flex items-center justify-between text-sm"><span className="text-[#4B5563]">{metric.label}</span><span className="font-semibold text-[#1B2A41]">{metric.value}</span></div>
                                  <div className="mt-3 h-2 rounded-full bg-[#1B2A41]/8"><div className="h-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E6C768] to-[#1B2A41]" style={{ width: metric.tone }} /></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                  <div className="grid gap-4">
                    <div className="clinical-glass-soft rounded-[1.75rem] p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B2A41] text-[#F2D16B]"><BrainCircuit className="h-5 w-5" /></div>
                      <p className="mt-4 text-sm uppercase tracking-[0.22em] text-[#B8962E]">{locale === 'es' ? 'Seguimiento longitudinal' : 'Longitudinal follow-up'}</p>
                      <p className="mt-3 text-lg font-semibold leading-7 text-[#1B2A41]">{locale === 'es' ? 'El estado clínico permanece legible entre sesiones.' : 'Clinical state remains legible between sessions.'}</p>
                    </div>
                    <div className="clinical-dark-panel rounded-[1.75rem] p-5 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">{locale === 'es' ? 'Guardrails clínicos' : 'Clinical guardrails'}</p>
                        <ShieldPlus className="h-5 w-5 text-[#F2D16B]" />
                      </div>
                      <div className="mt-4 grid gap-3">{copy.science.safetyItems.slice(0, 2).map((item: string) => <div key={item} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-sm leading-6 text-white/78">{item}</div>)}</div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[{ title: locale === 'es' ? 'Flujo clínico con cierre real' : 'Clinical flow with real closure', body: locale === 'es' ? 'Check-in, observer, progress y soporte trabajan como un sistema conectado.' : 'Check-in, observer, progress, and support work as one connected system.', icon: Sparkles }, { title: locale === 'es' ? 'Base visual' : 'Visual baseline', body: locale === 'es' ? 'Blanco, azul clínico, gris suave y acentos dorados con profundidad ligera.' : 'White, clinical blue, soft gray, and restrained gold accents with light depth.' }, { title: locale === 'es' ? 'Motion calm clinical' : 'Calm clinical motion', body: locale === 'es' ? 'Movimiento sutil, orgánico y performante, inspirado en Three.js sin sobrecargar.' : 'Subtle, organic, performant motion inspired by Three.js without overload.' }].map((item) => (
                    <div key={item.title} className="clinical-glass-soft rounded-[1.5rem] p-4">
                      {'icon' in item && item.icon ? <div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-[#D4AF37]" /><p className="text-sm font-semibold text-[#1B2A41]">{item.title}</p></div> : <p className="text-xs uppercase tracking-[0.22em] text-[#B8962E]">{item.title}</p>}
                      <p className={`mt-3 text-sm leading-6 text-[#4B5563] ${'icon' in item && item.icon ? '' : ''}`}>{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div><Badge variant="outline" className="border-[#E6C768]/40 bg-[#FFF7DA] px-4 py-2 text-sm text-[#1B2A41]">{copy.proof.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">{copy.proof.title}</h2></div>
                <div className="grid gap-4 md:grid-cols-3">{copy.proof.stats.map((stat: any) => <div key={stat[1]} className="animate-fade-up rounded-[1.5rem] border border-[#E6C768]/18 bg-[linear-gradient(180deg,#FFFFFF,#F7F9FC)] p-5"><p className="text-4xl font-semibold tracking-tight text-[#1B2A41]">{stat[0]}</p><p className="mt-2 text-sm font-medium text-[#B8962E]">{stat[1]}</p><p className="mt-3 text-sm leading-7 text-[#5B6474]">{stat[2]}</p></div>)}</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E6C768]/16 pt-6">{copy.proof.trustStrip.map((item: string) => <div key={item} className="rounded-full border border-[#1B2A41]/10 bg-[#F7F9FC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3A4A63]">{item}</div>)}</div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center"><Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy.why.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy.why.title}</h2><p className="mt-5 text-lg leading-8 text-[#4B5563]">{copy.why.description}</p></div>
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
              {copy.why.cards.map((card: any, index: number) => {
                const title = card.title ?? card[0];
                const description = card.description ?? card[1];
                const Icon = whyIcons[index];
                return <Card key={title} className={`group animate-fade-up rounded-[1.75rem] border border-white/80 bg-white/74 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${index === 0 ? 'justify-between lg:row-span-2 lg:min-h-[420px]' : ''}`}><CardHeader><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3C4] text-[#1B2A41] shadow-sm transition group-hover:scale-105"><Icon className="h-5 w-5 text-[#D4AF37]" /></div><CardTitle className="pt-3 text-2xl text-[#1B2A41]">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#5B6474]">{description}</p>{index === 0 && <div className="mt-8 rounded-[1.5rem] border border-[#E6C768]/20 bg-[linear-gradient(135deg,#1B2A41,#0F172A)] p-5 text-white"><p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">{locale === 'es' ? 'Lectura del caso' : 'Case reading'}</p><p className="mt-3 text-lg font-medium">{locale === 'es' ? 'Una sola vista integra severidad reciente, observer, progreso y tareas activas.' : 'A single view integrates recent severity, observer signals, progress, and active tasks.'}</p></div>}</CardContent></Card>;
              })}
            </div>
          </div>
        </section>

        <section id="modulos" className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center"><Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy.modules.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy.modules.title}</h2><p className="mt-5 text-lg leading-8 text-[#4B5563]">{copy.modules.description}</p></div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{copy.modules.cards.map((module: any) => { const Icon = getModuleIcon(module[0]); return <Card key={module[1]} className="group animate-fade-up rounded-[1.6rem] border border-white/80 bg-white/74 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"><CardHeader className="space-y-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3C4] shadow-sm"><Icon className="h-5 w-5 text-[#D4AF37]" /></div><CardTitle className="text-2xl text-[#1B2A41]">{module[1]}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#5B6474]">{module[2]}</p></CardContent></Card>; })}</div>
          </div>
        </section>

        <section id="como-funciona" className="py-12 md:py-20">
          <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="sticky top-24 space-y-5"><Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy.journey.badge}</Badge><h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy.journey.title}</h2></div>
            <div className="grid gap-5">{copy.journey.steps.map((step: any) => { const number = step.step ?? step[0]; const title = step.title ?? step[1]; const description = step.description ?? step[2]; return <div key={number} className="animate-fade-up rounded-[1.75rem] border border-[#E6C768]/20 bg-white/76 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition hover:border-[#E6C768]/40 hover:shadow-[0_22px_54px_rgba(15,23,42,0.1)]"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1B2A41] text-lg font-semibold text-[#F2D16B]">{number}</div><div><h3 className="text-xl font-semibold text-[#1B2A41]">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5B6474]">{description}</p></div></div></div>; })}</div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div><Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy.therapistDemo.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy.therapistDemo.title}</h2><p className="mt-5 max-w-[720px] text-lg leading-8 text-[#4B5563]">{copy.therapistDemo.description}</p><div className="mt-8 grid gap-4">{copy.therapistDemo.timeline.map((item: any, index: number) => <div key={item[0]} className="animate-fade-up rounded-[1.5rem] border border-white/80 bg-white/74 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl"><div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1B2A41] text-sm font-semibold text-[#F2D16B]">0{index + 1}</div><div><h3 className="text-lg font-semibold text-[#1B2A41]">{item[0]}</h3><p className="mt-2 text-sm leading-7 text-[#5B6474]">{item[1]}</p></div></div></div>)}</div></div>
              <div className="animate-soft-glow rounded-[2rem] border border-[#E6C768]/26 bg-[linear-gradient(180deg,#1B2A41,#0F172A)] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] md:p-8">
                <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.24em] text-[#F2D16B]">{copy.therapistDemo.panelTitle}</p><h3 className="mt-3 text-2xl font-semibold text-white">Patient overview</h3></div><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10"><Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={28} height={28} className="h-7 w-7 object-contain" /></div></div>
                <p className="mt-4 text-sm leading-7 text-white/72">{copy.therapistDemo.panelSummary}</p>
                <div className="mt-6 grid gap-4"><div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">{locale === 'es' ? 'Último check-in' : 'Latest check-in'}</p><p className="mt-2 text-xl font-semibold text-white">Moderate · 24/40</p></div><div className="rounded-full border border-[#E6C768]/20 bg-[#FFF3C4]/10 px-3 py-1 text-xs text-[#F2D16B]">{locale === 'es' ? 'hace 2 días' : '2 days ago'}</div></div><div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 w-[60%] rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D16B]" /></div></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"><p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">{locale === 'es' ? 'Observer reciente' : 'Recent observer'}</p><p className="mt-3 text-sm leading-7 text-white/72">{locale === 'es' ? 'Trigger: contaminación. Urgencia compulsiva: alta. Situación reciente documentada.' : 'Trigger: contamination. Compulsion urge: high. Recent situation documented.'}</p></div><div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"><p className="text-xs uppercase tracking-[0.22em] text-[#F2D16B]">{locale === 'es' ? 'Actividad reciente' : 'Recent activity'}</p><p className="mt-3 text-sm leading-7 text-white/72">{locale === 'es' ? 'Misión ERP activa, progreso longitudinal disponible y riesgo básico visible.' : 'Active ERP mission, longitudinal progress available, and basic risk visible.'}</p></div></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="rounded-[2rem] border border-[#E6C768]/24 bg-[#0F172A] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] md:px-8 md:py-10">
              <div className="max-w-3xl"><Badge className="border-white/12 bg-white/10 px-4 py-2 text-sm text-[#F2D16B] hover:bg-white/10">{copy.audiences.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{copy.audiences.title}</h2></div>
              <Tabs defaultValue="patients" className="mt-8">
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-white/8 p-1 md:w-fit"><TabsTrigger value="patients" className="rounded-xl px-5 py-3 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">{copy.audiences.patientTitle}</TabsTrigger><TabsTrigger value="therapists" className="rounded-xl px-5 py-3 text-sm data-[state=active]:bg-white data-[state=active]:text-[#0F172A]">{copy.audiences.therapistTitle}</TabsTrigger></TabsList>
                {(['patients', 'therapists'] as const).map((tab) => { const Icon = audienceIcons[tab]; const intro = tab === 'patients' ? copy.audiences.patientIntro : copy.audiences.therapistIntro; const items = tab === 'patients' ? copy.audiences.patientItems : copy.audiences.therapistItems; return <TabsContent key={tab} value={tab} className="mt-6"><div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"><div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-6 w-6 text-[#F2D16B]" /></div><h3 className="mt-4 text-2xl font-semibold">{tab === 'patients' ? copy.audiences.patientTitle : copy.audiences.therapistTitle}</h3><p className="mt-3 text-sm leading-7 text-white/72">{intro}</p></div><div className="grid gap-4">{items.map((item: string) => <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-5 transition hover:bg-white/8"><div className="flex gap-3"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37]" /><p className="text-sm leading-7 text-white/78">{item}</p></div></div>)}</div></div></TabsContent>; })}
              </Tabs>
            </div>
          </div>
        </section>

        <section id="base-clinica" className="py-12 md:py-20">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div><Badge variant="outline" className="border-[#E6C768]/40 bg-white/80 px-4 py-2 text-sm text-[#1B2A41]">{copy.science.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-5xl">{copy.science.title}</h2><p className="mt-5 max-w-[720px] text-lg leading-8 text-[#4B5563]">{copy.science.description}</p><div className="mt-8 grid gap-5">{copy.science.pillars.map((pillar: any) => <div key={pillar[0]} className="rounded-[1.5rem] border border-white/80 bg-white/74 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl"><h3 className="text-xl font-semibold text-[#1B2A41]">{pillar[0]}</h3><p className="mt-3 text-sm leading-7 text-[#5B6474]">{pillar[1]}</p></div>)}</div></div>
            <div className="rounded-[2rem] border border-[#E6C768]/26 bg-[linear-gradient(180deg,#1B2A41,#0F172A)] p-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><TriangleAlert className="h-5 w-5 text-[#F2D16B]" /></div><div><p className="text-sm uppercase tracking-[0.22em] text-[#F2D16B]">{copy.science.safetyTitle}</p><p className="mt-1 text-sm text-white/60">{locale === 'es' ? 'La narrativa pública también mantiene límites clínicos explícitos.' : 'The public narrative also keeps explicit clinical limits.'}</p></div></div><div className="mt-7 grid gap-4">{copy.science.safetyItems.map((item: string) => <div key={item} className="rounded-2xl border border-white/10 bg-white/6 p-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F2D16B]" /><p className="text-sm leading-7 text-white/78">{item}</p></div></div>)}</div></div>
          </div>
        </section>

        <section className="py-14 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="overflow-hidden rounded-[2.25rem] border border-[#E6C768]/26 bg-[radial-gradient(circle_at_top,rgba(242,209,107,0.18),transparent_34%),linear-gradient(135deg,#1B2A41,#0F172A)] px-6 py-10 text-white shadow-[0_34px_90px_rgba(15,23,42,0.22)] md:px-10 md:py-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center"><div><Badge className="border-white/12 bg-white/10 px-4 py-2 text-sm text-[#F2D16B] hover:bg-white/10">{copy.finalCta.badge}</Badge><h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{copy.finalCta.title}</h2><p className="mt-5 max-w-[720px] text-lg leading-8 text-white/74">{copy.finalCta.description}</p></div><div className="flex flex-col gap-3"><Button size="lg" asChild className="border-0 bg-[#D4AF37] text-white shadow-[0_14px_30px_rgba(212,175,55,0.25)] hover:bg-[#C49B2C]"><Link href={user ? '/dashboard' : '/login'} className="flex items-center gap-2">{copy.finalCta.primaryCta} <ArrowRight className="h-5 w-5" /></Link></Button><Button size="lg" variant="outline" asChild className="border-white/15 bg-white/8 text-white hover:bg-white/12"><a href="#modulos">{copy.finalCta.secondaryCta}</a></Button></div></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/80 py-10 backdrop-blur-xl">
        <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-[1.1fr_0.75fr_0.9fr]">
          <div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E6C768]/35 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.06)]"><Image src={BRAND_SYMBOL} alt="NeuroQuest symbol" width={28} height={28} className="h-7 w-7 object-contain" /></div><div><p className="text-base font-semibold text-[#1B2A41]">NeuroQuest</p><p className="text-xs text-[#6B7280]">Health-tech / mental health SaaS</p></div></div><p className="mt-4 max-w-[460px] text-sm leading-7 text-[#5B6474]">{copy.footer.productDescription}</p></div>
          <div><p className="text-sm font-semibold text-[#1B2A41]">{copy.footer.linksTitle}</p><div className="mt-4 grid gap-2">{copy.footer.links.map((link: string) => <p key={link} className="text-sm text-[#5B6474]">{link}</p>)}</div></div>
          <div><p className="text-sm font-semibold text-[#1B2A41]">{copy.footer.safetyTitle}</p><p className="mt-4 text-sm leading-7 text-[#5B6474]">{copy.footer.safetyDescription}</p></div>
        </div>
        <div className="container mt-8 flex flex-col gap-3 border-t border-[#E6C768]/20 px-4 pt-6 text-sm text-[#6B7280] md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p>{copy.footer.rightsPrefix} <a href="https://krakendigitalabs.com" target="_blank" rel="noreferrer" className="font-medium text-[#1B2A41] underline decoration-[#D4AF37] underline-offset-4 transition hover:text-[#D4AF37]">{copy.footer.ownerName}</a>.</p>
          <p>{copy.footer.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
