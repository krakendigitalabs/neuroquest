'use client';

import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react";

type UserProgressProps = {
  level: string | number;
  currentXp: number;
  xpToNextLevel: number;
};

export function UserProgress({ level, currentXp, xpToNextLevel }: UserProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar on mount/update
    const newProgress = (currentXp / xpToNextLevel) * 100;
    const timer = setTimeout(() => setProgress(newProgress), 300);
    return () => clearTimeout(timer);
  }, [currentXp, xpToNextLevel]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-sidebar-foreground">{level}</span>
        <span className="shrink-0 text-[11px] font-semibold text-sidebar-primary sm:text-xs">{currentXp} / {xpToNextLevel} XP</span>
      </div>
      <Progress value={progress} className="h-2 w-full" />
    </div>
  )
}
