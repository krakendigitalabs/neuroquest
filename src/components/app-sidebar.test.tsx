import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'nav.dashboard') return 'Dashboard';
      if (key === 'nav.checkIn') return 'Check-In';
      if (key === 'nav.progress') return 'Progress';
      if (key === 'nav.observer') return 'Observer';
      if (key === 'nav.exposure') return 'Exposure';
      if (key === 'nav.reprogram') return 'Reprogram';
      if (key === 'nav.regulation') return 'Regulation';
      if (key === 'nav.grounding') return 'Grounding';
      if (key === 'sidebar.logout') return 'Logout';
      if (key === 'sidebar.user') return 'User';
      if (key === 'nav.wellness') return 'Wellness';
      if (key === 'nav.medication') return 'Prescribed Medication';
      if (key === 'nav.workspaceUsers') return 'Workspace users';
      if (key === 'accountRoles.viewer') return 'View only';
      if (key === 'userRoles.patient') return 'Patient user';
      if (key === 'userProgress.level') return `Level ${values?.level ?? 1}`;
      if (key === 'languageSwitcher.english') return 'English';
      if (key === 'languageSwitcher.spanish') return 'Spanish';
      if (key === 'sidebar.crisisSupport') return 'Crisis support';
      return key;
    },
  }),
}));

vi.mock('@/firebase', () => ({
  useFirebase: () => ({
    auth: {},
    user: { displayName: 'Pat Doe' },
  }),
}));

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
}));

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: () => ({
    userProfile: {
      displayName: 'Pat Doe',
      accountRole: 'viewer',
      userRole: 'patient',
      level: 3,
      currentXp: 40,
      xpToNextLevel: 100,
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/use-access-me', () => ({
  useAccessMe: () => ({
      access: {
        role: 'patient',
        visibleModules: ['check-in', 'observer', 'progress', 'medication'],
        routeAccess: ['/check-in', '/observer', '/progress', '/medication'],
        actions: { canCreateModules: false, canManageWorkspaceUsers: false },
      },
      isLoading: false,
    }),
}));

vi.mock('./logo', () => ({
  Logo: () => <div>Logo</div>,
}));

vi.mock('./user-avatar', () => ({
  UserAvatar: () => <div>Avatar</div>,
}));

vi.mock('./user-progress', () => ({
  UserProgress: () => <div>User progress</div>,
}));

vi.mock('./crisis-button', () => ({
  CrisisButton: () => <button type="button">Crisis support</button>,
}));

describe('AppSidebar', () => {
  it('shows only real MVP navigation items in the main flow', () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Check-In')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Observer')).toBeInTheDocument();
    expect(screen.getByText('Prescribed Medication')).toBeInTheDocument();
    expect(screen.queryByText('Workspace users')).not.toBeInTheDocument();
    expect(screen.getByText('View only · Patient user · Level 3')).toBeInTheDocument();
    expect(screen.queryByText('Challenges')).not.toBeInTheDocument();
  });
});
