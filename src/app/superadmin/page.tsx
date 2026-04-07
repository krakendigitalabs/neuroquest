'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export default function SuperadminGatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextPath = useMemo(() => {
    const rawNext = searchParams.get('next') ?? '';
    const safeNext = rawNext.startsWith('/superadmin/') ? rawNext : '/superadmin/dashboard';

    if (safeNext === '/superadmin/login') {
      return '/superadmin/login';
    }

    return `/superadmin/login?next=${encodeURIComponent(safeNext)}`;
  }, [searchParams]);

  const handleDigit = (digit: string) => {
    setError('');
    setPin((current) => (current.length >= 3 ? current : `${current}${digit}`));
  };

  const handleBackspace = () => {
    setError('');
    setPin((current) => current.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 3) {
      setError('Ingresa un PIN de 3 dígitos.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/superadmin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        setError('PIN inválido o configuración no disponible.');
        return;
      }

      router.push(nextPath);
    } catch {
      setError('No se pudo validar el acceso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_30%),linear-gradient(180deg,#08111F_0%,#101A2B_55%,#16243A_100%)] px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-[#F2D16B]">
            <ShieldCheck className="h-4 w-4" />
            Superadmin Gate
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Acceso operativo con doble control y diseño limpio.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Primero validas el PIN en servidor. Después entras por Google con un correo exacto autorizado para administración.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 text-sm leading-7 text-white/74 backdrop-blur-2xl">
            Esta puerta no usa contraseña fija en código. El PIN real se lee desde entorno y deja una cookie segura para la siguiente pantalla.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-3xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#08111F]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#F2D16B]">Paso 1</p>
              <h2 className="text-2xl font-semibold">Ingresa el PIN</h2>
            </div>
          </div>

          <div className="mb-6 flex justify-center gap-3">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className={`flex h-16 w-14 items-center justify-center rounded-2xl border text-2xl font-semibold ${
                  pin[slot] ? 'border-[#D4AF37] bg-[#D4AF37]/12 text-white' : 'border-white/10 bg-white/6 text-white/28'
                }`}
              >
                {pin[slot] ? '•' : ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {KEYPAD.slice(0, 9).map((digit) => (
              <Button
                key={digit}
                type="button"
                variant="outline"
                className="h-16 rounded-2xl border-white/12 bg-white/8 text-xl text-white hover:bg-white/14"
                onClick={() => handleDigit(digit)}
              >
                {digit}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-16 rounded-2xl border-white/12 bg-white/8 text-sm text-white hover:bg-white/14"
              onClick={handleBackspace}
            >
              Borrar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-16 rounded-2xl border-white/12 bg-white/8 text-xl text-white hover:bg-white/14"
              onClick={() => handleDigit('0')}
            >
              0
            </Button>
            <Button
              type="button"
              className="h-16 rounded-2xl border-0 bg-[#D4AF37] text-[#08111F] hover:bg-[#E1BF55]"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Validando' : 'Entrar'}
            </Button>
          </div>

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
