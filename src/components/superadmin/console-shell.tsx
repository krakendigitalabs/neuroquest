'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPERADMIN_NAV_ITEMS = [
  { href: '/superadmin/dashboard', label: 'Dashboard' },
  { href: '/superadmin/accounts', label: 'Cuentas' },
  { href: '/superadmin/modules', label: 'Módulos' },
  { href: '/superadmin/themes', label: 'Temas' },
  { href: '/superadmin/invites', label: 'Invitados' },
];

export function SuperadminConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSuperadminLogout = async () => {
    await fetch('/api/superadmin/session', {
      method: 'DELETE',
      credentials: 'include',
    });

    router.push('/superadmin');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1400px] md:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-800/80 bg-slate-900/80 p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-amber-400/15 p-2 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">NeuroQuest</p>
              <p className="text-sm font-semibold">Consola Superadmin</p>
            </div>
          </div>

          <nav className="space-y-2">
            {SUPERADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    isActive ? 'bg-amber-300/15 text-amber-200' : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800"
              onClick={handleSuperadminLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
