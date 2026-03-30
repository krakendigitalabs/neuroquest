'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Brain,
  Eye,
  HeartPulse,
  Apple,
  Pill,
  Route,
  BarChart3,
  LogOut,
  Zap,
  ClipboardCheck,
  Users,
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { UserProgress } from '@/components/user-progress';
import { CrisisButton } from '@/components/crisis-button';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserAvatar } from './user-avatar';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAccessMe } from '@/hooks/use-access-me';
import type { ModuleKey } from '@/modules/access/access.types';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { auth, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { access, isLoading: isAccessLoading } = useAccessMe();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoutClick = async () => {
    handleNavigate();
    await handleLogout();
  };

  const moduleNavItems: Record<ModuleKey, { href: string; icon: ReactNode; label: string }> = {
    'check-in': { href: '/check-in', icon: <ClipboardCheck />, label: t('nav.checkIn') },
    observer: { href: '/observer', icon: <Eye />, label: t('nav.observer') },
    exposure: { href: '/exposure', icon: <Route />, label: t('nav.exposure') },
    reprogram: { href: '/reprogram', icon: <Brain />, label: t('nav.reprogram') },
    regulation: { href: '/regulation', icon: <HeartPulse />, label: t('nav.regulation') },
    wellness: { href: '/wellness', icon: <Apple />, label: t('nav.wellness') },
    medication: { href: '/medication', icon: <Pill />, label: t('nav.medication') },
    grounding: { href: '/grounding', icon: <Zap />, label: t('nav.grounding') },
    progress: { href: '/progress', icon: <BarChart3 />, label: t('nav.progress') },
    'medical-support': { href: '/medical-support', icon: <Pill />, label: t('medical.title') },
  };

  const shouldShowDashboard =
    !!access && (access.actions.canCreateModules || access.routeAccess.some((route) => route !== '/check-in'));

  const navItems = [
    ...(shouldShowDashboard ? [{ href: '/dashboard', icon: <LayoutDashboard />, label: t('nav.dashboard') }] : []),
    ...((access?.visibleModules ?? []).map((moduleKey) => moduleNavItems[moduleKey]).filter(Boolean)),
  ];
  const managementItems = access?.actions.canCreateModules
    ? [{ href: '/workspace-users', icon: <Users />, label: t('nav.workspaceUsers') }]
    : [];

  return (
    <Sidebar>
      <SidebarHeader className="gap-3 p-3 sm:p-2">
        <Logo className="min-w-0" />
      </SidebarHeader>

      <SidebarContent>
        <div className="flex min-w-0 flex-col gap-3 p-3 sm:gap-4 sm:p-2">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar className="h-10 w-10 shrink-0 sm:h-8 sm:w-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold sm:text-base">
                {isProfileLoading || isAccessLoading
                  ? '...'
                  : userProfile?.displayName || user?.displayName || t('sidebar.user')}
              </p>
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                {isProfileLoading || isAccessLoading
                  ? '...'
                  : `${t(`accountRoles.${userProfile?.accountRole ?? 'viewer'}`)} · ${t(`userRoles.${userProfile?.userRole ?? 'patient'}`)} · ${t('userProgress.level', { level: userProfile?.level ?? 1 })}`}
              </p>
            </div>
          </div>

          <UserProgress
            level={isProfileLoading || !userProfile ? 1 : (userProfile.level ?? 1)}
            currentXp={isProfileLoading || !userProfile ? 0 : userProfile.currentXp}
            xpToNextLevel={isProfileLoading || !userProfile ? 100 : userProfile.xpToNextLevel}
          />
        </div>

        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
                className="min-h-11 px-3 py-2 text-sm sm:min-h-8 sm:px-2 sm:py-2"
              >
                <Link href={item.href} onClick={handleNavigate}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {managementItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
                className="min-h-11 px-3 py-2 text-sm sm:min-h-8 sm:px-2 sm:py-2"
              >
                <Link href={item.href} onClick={handleNavigate}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3 pt-2 sm:gap-2 sm:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogoutClick} className="min-h-11 px-3 py-2 text-sm sm:min-h-8 sm:px-2 sm:py-2">
              <LogOut />
              <span>{t('sidebar.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <LanguageSwitcher className="group-data-[collapsible=icon]:flex-col" />

        <SidebarSeparator />

        <div>
          <CrisisButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
