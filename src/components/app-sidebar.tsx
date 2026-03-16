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
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { UserProgress } from '@/components/user-progress';
import { CrisisButton } from '@/components/crisis-button';
import { useTranslation } from '@/context/language-provider';
import { Button } from './ui/button';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserAvatar } from './user-avatar';

export function AppSidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { auth, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const navItems = [
    { href: '/dashboard', icon: <LayoutDashboard />, label: t('nav.dashboard') },
    { href: '/observer', icon: <Eye />, label: t('nav.observer') },
    { href: '/exposure', icon: <Route />, label: t('nav.exposure') },
    { href: '/regulation', icon: <HeartPulse />, label: t('nav.regulation') },
    { href: '/grounding', icon: <Zap />, label: t('nav.grounding') },
    { href: '/reprogram', icon: <Brain />, label: t('nav.reprogram') },
    { href: '/progress', icon: <BarChart3 />, label: t('nav.progress') },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <div className="p-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar />
            <div>
              <p className="font-semibold">{isProfileLoading ? '...' : (userProfile?.displayName || user?.displayName || t('sidebar.user'))}</p>
              <p className="text-xs text-muted-foreground">{isProfileLoading ? '...' : userProfile ? t('userProgress.level', { level: userProfile.level }) : t('sidebar.level')}</p>
            </div>
          </div>
          <UserProgress 
            level={isProfileLoading || !userProfile ? t('userProgress.level', { level: 0 }) : t('userProgress.level', { level: userProfile.level })}
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
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>{t('sidebar.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <div className="p-2 flex gap-1 group-data-[collapsible=icon]:flex-col">
            <Button variant={locale === 'en' ? 'secondary' : 'ghost'} size="sm" className="flex-1 justify-start" onClick={() => setLocale('en')}>
                <span className="w-6 h-6 flex items-center justify-center">EN</span>
                <span className="group-data-[collapsible=icon]:hidden">{t('languageSwitcher.english')}</span>
            </Button>
            <Button variant={locale === 'es' ? 'secondary' : 'ghost'} size="sm" className="flex-1 justify-start" onClick={() => setLocale('es')}>
                <span className="w-6 h-6 flex items-center justify-center">ES</span>
                <span className="group-data-[collapsible=icon]:hidden">{t('languageSwitcher.spanish')}</span>
            </Button>
        </div>
        <SidebarSeparator />
        <div className="p-2">
          <CrisisButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
