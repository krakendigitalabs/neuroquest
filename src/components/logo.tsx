import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center', className)}>
      <Image
        src="https://res.cloudinary.com/dr50ioh9h/image/upload/v1774634796/logo_neuroquest_bwnnf4.png"
        alt="NeuroQuest"
        width={220}
        height={56}
        priority
        className="h-10 w-auto max-w-full object-contain sm:h-12"
      />
    </div>
  );
}
