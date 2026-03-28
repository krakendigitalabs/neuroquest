'use client';

import { Mail, MessageCircleMore, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-provider';

type PatientReportActionsProps = {
  reportTitle: string;
  reportText: string;
};

export function PatientReportActions({ reportTitle, reportText }: PatientReportActionsProps) {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = `${t('reports.emailSubjectPrefix')}: ${reportTitle}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportText)}`;
    window.open(mailtoUrl, '_self');
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={handlePrint}>
        <Printer className="h-4 w-4" />
        {t('reports.printPdf')}
      </Button>
      <Button type="button" variant="outline" onClick={handleWhatsApp}>
        <MessageCircleMore className="h-4 w-4" />
        {t('reports.sendWhatsApp')}
      </Button>
      <Button type="button" variant="outline" onClick={handleEmail}>
        <Mail className="h-4 w-4" />
        {t('reports.sendEmail')}
      </Button>
    </div>
  );
}
