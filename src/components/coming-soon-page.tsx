'use client';

import Link from 'next/link';
import { ArrowLeft, Construction, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ComingSoonPageProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel: string;
  badge: string;
  readyTitle: string;
  readyDescription: string;
  readyItems: string[];
  crisisHref?: string;
  crisisLabel?: string;
};

export function ComingSoonPage({
  title,
  description,
  backHref = '/dashboard',
  backLabel,
  badge,
  readyTitle,
  readyDescription,
  readyItems,
  crisisHref,
  crisisLabel,
}: ComingSoonPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-border/70 bg-card">
          <CardHeader className="gap-4 bg-gradient-to-br from-muted/70 via-background to-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-background shadow-sm">
                <Construction className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="w-fit">
                {badge}
              </Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-6">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="rounded-2xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">{readyDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={backHref}>
                  <ArrowLeft className="h-4 w-4" />
                  {backLabel}
                </Link>
              </Button>
              {crisisHref && crisisLabel ? (
                <Button asChild variant="outline">
                  <Link href={crisisHref}>{crisisLabel}</Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{readyTitle}</CardTitle>
            </div>
            <CardDescription>{readyDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyItems.map((item) => (
              <div key={item} className="rounded-xl border bg-muted/20 p-3 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
