import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PatientReportActions } from './patient-report-actions';

const openMock = vi.fn();
const printMock = vi.fn();

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'reports.printPdf') return 'Print / PDF';
      if (key === 'reports.sendWhatsApp') return 'Send by WhatsApp';
      if (key === 'reports.sendEmail') return 'Send by email';
      if (key === 'reports.emailSubjectPrefix') return 'NeuroQuest report';
      return key;
    },
  }),
}));

describe('PatientReportActions', () => {
  beforeEach(() => {
    openMock.mockReset();
    printMock.mockReset();
    vi.stubGlobal('open', openMock);
    vi.stubGlobal('print', printMock);
  });

  it('prints, opens WhatsApp, and opens mailto with the report content', () => {
    render(
      <PatientReportActions
        reportTitle="Printable clinical report"
        reportText={'Line 1\nLine 2'}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Print / PDF' }));
    expect(printMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Send by WhatsApp' }));
    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/?text='),
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Send by email' }));
    expect(openMock).toHaveBeenCalledWith(
      expect.stringContaining('mailto:?subject=NeuroQuest%20report%3A%20Printable%20clinical%20report'),
      '_self'
    );
  });
});
