'use client';

import Link from 'next/link';
import { Construction } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ComingSoonPage({
  title,
  description,
  backHref = '/dashboard',
  backLabel,
}: {
  title: string;
  description: string;
  backHref?: string;
  backLabel: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Construction className="h-6 w-6" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
