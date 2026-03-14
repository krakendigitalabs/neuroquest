import Link from 'next/link';
import { BrainCircuit, ShieldCheck, Target, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function Home() {
  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: 'Therapeutic Modules',
      description: 'Engage with exercises for thought logging, exposure therapy, and emotional regulation.',
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: 'Gamified Progression',
      description: 'Earn XP, level up, and unlock achievements as you build mental resilience.',
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'AI Personalization',
      description: 'Receive personalized missions and coaching based on your unique patterns.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Therapist Dashboard',
      description: 'Allow professionals to monitor progress and provide guided support.',
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
          <Link
            href="/therapist"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Therapist Portal
          </Link>
          <Button asChild>
            <Link href="/dashboard">Launch App</Link>
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
                    Transform Your Mind, Conquer Your Quest
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    NeuroQuest is a gamified mental wellness platform designed to help you manage intrusive thoughts, anxiety, and compulsions through proven therapeutic techniques.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Start Your Journey <ArrowRight className="h-5 w-5" />
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
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A New Approach to Mental Wellness</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform integrates principles from CBT, ERP, and neuroscience into a structured, engaging, and supportive experience.
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
        <p className="text-xs text-muted-foreground">&copy; 2024 NeuroQuest. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <p className="text-xs text-muted-foreground">This system does not replace clinical therapy.</p>
        </nav>
      </footer>
    </div>
  );
}
