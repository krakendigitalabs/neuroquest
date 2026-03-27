'use client';

import { AlertTriangle, Building2, Hospital, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/context/language-provider';

export default function CrisisPage() {
  const { t } = useTranslation();

  const emergencyLines = [
    {
      title: t('crisis.medellin.mainEmergency.title'),
      description: t('crisis.medellin.mainEmergency.desc'),
    },
    {
      title: t('crisis.medellin.mentalCrisis.title'),
      description: t('crisis.medellin.mentalCrisis.desc'),
    },
  ];

  const otherLines = [
    t('crisis.medellin.medicalEmergency'),
    t('crisis.medellin.firefighters'),
    t('crisis.medellin.police'),
    t('crisis.medellin.redCross'),
    t('crisis.medellin.civilDefense'),
    t('crisis.medellin.gaula'),
    t('crisis.medellin.womensHelpline'),
    t('crisis.medellin.disasterRelief'),
  ];

  const mentalHealthSections = [
    {
      title: t('crisis.medellin.recognizedClinicsTitle'),
      icon: Building2,
      items: [
        t('crisis.medellin.recognizedClinics.sanJuanDeDios'),
        t('crisis.medellin.recognizedClinics.delOriente'),
        t('crisis.medellin.recognizedClinics.sagradoCorazon'),
        t('crisis.medellin.recognizedClinics.insam'),
        t('crisis.medellin.recognizedClinics.samein'),
        t('crisis.medellin.recognizedClinics.nuevaVida'),
        t('crisis.medellin.recognizedClinics.miDescanso'),
        t('crisis.medellin.recognizedClinics.laFlorida'),
      ],
    },
    {
      title: t('crisis.medellin.specializedCentersTitle'),
      icon: Building2,
      items: [
        t('crisis.medellin.specializedCenters.cuidarte'),
        t('crisis.medellin.specializedCenters.mentePlena'),
        t('crisis.medellin.specializedCenters.conciencia'),
        t('crisis.medellin.specializedCenters.cic'),
        t('crisis.medellin.specializedCenters.institutoDolor'),
        t('crisis.medellin.specializedCenters.miMente'),
        t('crisis.medellin.specializedCenters.emotivamente'),
        t('crisis.medellin.specializedCenters.sentidoRealidad'),
        t('crisis.medellin.specializedCenters.preactiva'),
      ],
    },
    {
      title: t('crisis.medellin.psychiatricHospitalsTitle'),
      icon: Hospital,
      items: [
        t('crisis.medellin.psychiatricHospitals.hospitalMental'),
        t('crisis.medellin.psychiatricHospitals.hospitalGeneral'),
        t('crisis.medellin.psychiatricHospitals.pabloTobon'),
        t('crisis.medellin.psychiatricHospitals.lasVegas'),
      ],
    },
    {
      title: t('crisis.medellin.otherCentersTitle'),
      icon: Building2,
      items: [
        t('crisis.medellin.otherCenters.elPoblado'),
        t('crisis.medellin.otherCenters.medplus'),
        t('crisis.medellin.otherCenters.cadSamein'),
      ],
    },
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t('crisis.medellin.title')}</h2>
                  <p className="text-sm text-muted-foreground">{t('crisis.medellin.directoryDescription')}</p>
                </div>

                {emergencyLines.map(resource => (
                  <Card key={resource.title} className="bg-background">
                    <CardHeader>
                      <CardTitle className="text-xl">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{resource.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {t('crisis.medellin.otherLinesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {otherLines.map(line => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {mentalHealthSections.map(section => {
                const Icon = section.icon;

                return (
                  <Card key={section.title} className="bg-background">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {section.items.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}

              <Card className="bg-background">
                <CardHeader>
                  <CardTitle className="text-xl">{t('crisis.medellin.urgentCareTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('crisis.medellin.urgentCareDescription')}</p>
                </CardContent>
              </Card>
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
