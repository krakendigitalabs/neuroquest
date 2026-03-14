'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase } from '@/firebase';

export function UserAvatar({ className }: { className?: string }) {
  const { user } = useFirebase();

  const fallback = user?.displayName?.[0] ?? user?.email?.[0] ?? 'U';

  return (
    <Avatar className={className}>
      {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? 'User avatar'} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

    