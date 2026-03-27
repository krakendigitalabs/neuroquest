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
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-sidebar-foreground">{level}</span>
        <span className="text-xs font-semibold text-sidebar-primary">{currentXp} / {xpToNextLevel} XP</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
