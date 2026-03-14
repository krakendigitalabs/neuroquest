'use client';

import { AlertTriangle, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/context/language-provider';

export default function CrisisPage() {
  const { t } = useTranslation();

  const resources = [
    { name: 'National Suicide Prevention Lifeline', phone: '988', description: t('crisis.resource1Desc') },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: t('crisis.resource2Desc') },
    { name: 'The Trevor Project', phone: '1-866-488-7386', description: t('crisis.resource3Desc') },
    { name: 'NAMI Helpline', phone: '1-800-950-NAMI (6264)', description: t('crisis.resource4Desc') },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-destructive/10">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b">
        <h1 className="text-xl font-bold flex items-center gap-2 text-destructive">
          <AlertTriangle />
          {t('crisis.title')}
        </h1>
        <div className="ml-auto">
          <Button asChild variant="outline">
            <Link href="/dashboard">{t('crisis.backToApp')}</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive bg-background">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">{t('crisis.notAlone')}</CardTitle>
              <CardDescription className="text-lg">
                {t('crisis.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map(resource => (
                <Card key={resource.name} className="bg-background">
                  <CardHeader>
                    <CardTitle className="text-xl">{resource.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <Phone />
                      <span>{resource.phone}</span>
                    </p>
                    <p className="text-muted-foreground mt-2">{resource.description}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

           <div className="text-center mt-8 text-muted-foreground">
             <p>{t('crisis.disclaimer')}</p>
           </div>
        </div>
      </main>
    </div>
  );
}
