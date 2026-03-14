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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Brain,
  Eye,
  HeartPulse,
  Route,
  BarChart3,
} from 'lucide-react';

import { Logo } from '@/components/logo';
import { UserProgress } from '@/components/user-progress';
import { CrisisButton } from '@/components/crisis-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
  { href: '/observer', icon: <Eye />, label: 'Mental Observer' },
  { href: '/exposure', icon: <Route />, label: 'Exposure Mode' },
  { href: '/regulation', icon: <HeartPulse />, label: 'Emotion Regulation' },
  { href: '/reprogram', icon: <Brain />, label: 'Cognitive Reprogramming' },
  { href: '/progress', icon: <BarChart3 />, label: 'Progress' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const avatarImage = PlaceHolderImages.find((img) => img.id === 'avatar-1');

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <div className="p-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {avatarImage && (
                <AvatarImage src={avatarImage.imageUrl} alt="User Avatar" />
              )}
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">User</p>
              <p className="text-xs text-muted-foreground">Novato Mental</p>
            </div>
          </div>
          <UserProgress level="Level 1" currentXp={75} xpToNextLevel={150} />
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
        <SidebarSeparator />
        <div className="p-2">
          <CrisisButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
