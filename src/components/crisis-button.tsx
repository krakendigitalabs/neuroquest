'use client';

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/context/language-provider";

export function CrisisButton() {
  const { t } = useTranslation();
  return (
    <Button variant="destructive" className="w-full justify-start gap-2" asChild>
      <Link href="/crisis">
        <AlertTriangle className="h-5 w-5" />
        <span>{t('sidebar.crisisSupport')}</span>
      </Link>
    </Button>
  )
}
