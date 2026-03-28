'use client';

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
  Route,
  BarChart3,
  LogOut,
  Zap,
  ClipboardCheck,
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

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { auth, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
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

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: t('nav.dashboard') },
    { href: '/check-in', icon: <ClipboardCheck />, label: t('nav.checkIn') },
    { href: '/observer', icon: <Eye />, label: t('nav.observer') },
    { href: '/exposure', icon: <Route />, label: t('nav.exposure') },
    { href: '/reprogram', icon: <Brain />, label: t('nav.reprogram') },
    { href: '/regulation', icon: <HeartPulse />, label: t('nav.regulation') },
    { href: '/grounding', icon: <Zap />, label: t('nav.grounding') },
    { href: '/progress', icon: <BarChart3 />, label: t('nav.progress') },
  ];

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
                {isProfileLoading
                  ? '...'
                  : userProfile?.displayName || user?.displayName || t('sidebar.user')}
              </p>
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                {isProfileLoading
                  ? '...'
                  : t('userProgress.level', { level: userProfile?.level ?? 1 })}
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
