import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { HomeLanding } from './home-landing';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <div aria-label={alt} />,
}));

vi.mock('@/hooks/use-therapist-access', () => ({
  useTherapistAccess: () => ({
    hasTherapistAccess: false,
  }),
}));

vi.mock('@/firebase', () => ({
  useUser: () => ({
    user: null,
  }),
}));

vi.mock('@/components/home/hero-neural-canvas', () => ({
  HeroNeuralCanvas: () => <div>Canvas</div>,
}));

vi.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => <div>Language switcher</div>,
}));

vi.mock('@/components/home/landing-icons', () => ({
  ShieldCheck: () => <div>Shield</div>,
  whyIcons: [() => <div>Icon 1</div>, () => <div>Icon 2</div>, () => <div>Icon 3</div>],
  audienceIcons: {
    patients: () => <div>Patients icon</div>,
    therapists: () => <div>Therapists icon</div>,
  },
  getModuleIcon: () => () => <div>Module icon</div>,
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'appName') return 'NeuroQuest';
      return key;
    },
    tm: (key: string) => {
      if (key !== 'landing') return key;

      return {
        brand: { tagline: 'Health-tech / mental health SaaS' },
        nav: {
          howItWorks: 'How it works',
          modules: 'Modules',
          science: 'Clinical basis',
          therapist: 'Therapist portal',
          cta: 'Open the app',
        },
        hero: {
          badge: 'Badge',
          title: 'Hero title',
          description: 'Hero description',
          primaryCta: 'Start now',
          secondaryCta: 'See how it works',
          trustPoints: ['Point 1'],
          productViewEyebrow: 'Eyebrow',
          productViewTitle: 'Product title',
          previewTabs: [
            {
              value: 'dashboard',
              label: 'Dashboard',
              badge: 'Dashboard badge',
              title: 'Dashboard title',
              body: 'Dashboard body',
              chips: ['Chip'],
              metrics: [{ label: 'Metric', value: 'Value', tone: '50%' }],
            },
          ],
          followUpEyebrow: 'Follow up',
          followUpTitle: 'Follow up title',
          guardrailsEyebrow: 'Guardrails',
          highlights: [{ title: 'Highlight', body: 'Body' }],
        },
        proof: {
          badge: 'Proof',
          title: 'Proof title',
          stats: [['10', 'Stat', 'Description']],
          trustStrip: ['Trust'],
        },
        why: {
          badge: 'Why',
          title: 'Why title',
          description: 'Why description',
          cards: [
            { title: 'Card 1', description: 'Desc 1' },
            { title: 'Card 2', description: 'Desc 2' },
            { title: 'Card 3', description: 'Desc 3' },
          ],
          caseReadingEyebrow: 'Case',
          caseReadingTitle: 'Case title',
        },
        modules: {
          badge: 'Modules badge',
          title: 'Modules title',
          description: 'Modules description',
          cards: [['checkin', 'Module 1', 'Description 1']],
        },
        journey: {
          badge: 'Journey badge',
          title: 'Journey title',
          steps: [{ step: '01', title: 'Step 1', description: 'Desc' }],
        },
        therapistDemo: {
          badge: 'Therapist badge',
          title: 'Therapist title',
          description: 'Therapist description',
          panelTitle: 'Panel',
          panelHeading: 'Heading',
          panelSummary: 'Summary',
          latestCheckInLabel: 'Latest',
          latestCheckInValue: 'Moderate',
          latestCheckInRelative: '2 days ago',
          observerLabel: 'Observer',
          observerBody: 'Observer body',
          activityLabel: 'Activity',
          activityBody: 'Activity body',
          timeline: [['T1', 'D1']],
        },
        audiences: {
          badge: 'Audiences',
          title: 'Audiences title',
          patientTitle: 'Patients',
          therapistTitle: 'Therapists',
          patientIntro: 'Patient intro',
          therapistIntro: 'Therapist intro',
          patientItems: ['Patient item'],
          therapistItems: ['Therapist item'],
        },
        activation: {
          badge: 'Role-guided entry',
          title: 'Each type of user starts from a clearer flow.',
          description: 'Activation description',
          cards: [
            { role: 'patient', title: 'Patient', description: 'Patient description', helper: 'Patient helper', cta: 'Enter as patient' },
            { role: 'professional', title: 'Professional', description: 'Professional description', helper: 'Professional helper', cta: 'Enter as professional' },
            { role: 'clinic', title: 'Clinic', description: 'Clinic description', helper: 'Clinic helper', cta: 'Enter as clinic' },
          ],
        },
        science: {
          badge: 'Science badge',
          title: 'Science title',
          description: 'Science description',
          pillars: [['Pillar', 'Description']],
          safetyTitle: 'Safety title',
          safetyIntro: 'Safety intro',
          safetyItems: ['Safety item 1', 'Safety item 2'],
        },
        finalCta: {
          badge: 'Final badge',
          title: 'Final title',
          description: 'Final description',
          primaryCta: 'Primary',
          secondaryCta: 'Secondary',
        },
        donation: {
          badge: 'Donation badge',
          title: 'Donation title',
          description: 'Donation description',
          formTitle: 'Donation form',
          fields: {
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
          },
          helper: 'Helper',
          cta: 'Donate',
          linkLabel: 'Donation link',
        },
        footer: {
          productDescription: 'Footer description',
          linksTitle: 'Links',
          links: ['How it works', 'Modules', 'Science', 'Therapist'],
          safetyTitle: 'Footer safety',
          safetyDescription: 'Footer safety description',
          rightsPrefix: 'Rights',
          ownerName: 'Owner',
          disclaimer: 'Disclaimer',
        },
      };
    },
  }),
}));

describe('HomeLanding activation funnel', () => {
  it('exposes a single system access entry point in the header', () => {
    render(<HomeLanding />);

    expect(screen.getByRole('link', { name: 'Comenzar tu viaje' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: 'Enter as patient' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Enter as professional' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Enter as clinic' })).not.toBeInTheDocument();
  });
});
