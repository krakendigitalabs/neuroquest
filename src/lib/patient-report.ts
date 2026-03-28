export type PatientReportSection = {
  title: string;
  lines: string[];
};

type BuildPatientReportTextInput = {
  title: string;
  patientLabel: string;
  patient: string;
  generatedAtLabel: string;
  generatedAt: string;
  summaryTitle: string;
  summary: string;
  sections?: PatientReportSection[];
  patientSignatureLabel: string;
  therapistSignatureLabel: string;
};

export function buildPatientReportText({
  title,
  patientLabel,
  patient,
  generatedAtLabel,
  generatedAt,
  summaryTitle,
  summary,
  sections = [],
  patientSignatureLabel,
  therapistSignatureLabel,
}: BuildPatientReportTextInput) {
  const lines = [
    title,
    '',
    `${patientLabel}: ${patient}`,
    `${generatedAtLabel}: ${generatedAt}`,
    '',
    `${summaryTitle}:`,
    summary,
  ];

  for (const section of sections) {
    if (!section.lines.length) continue;
    lines.push('', `${section.title}:`, ...section.lines);
  }

  lines.push('', `${patientSignatureLabel}: ____________________`, `${therapistSignatureLabel}: ____________________`);

  return lines.join('\n');
}
