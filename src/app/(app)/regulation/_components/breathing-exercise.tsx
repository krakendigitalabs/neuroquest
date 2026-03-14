'use client';

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

type BreathingExerciseProps = {
  title: string;
  description: string;
  icon: ReactNode;
  steps: string[];
};

export function BreathingExercise({ title, description, icon, steps }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const totalDuration = useMemo(() => steps.reduce((acc, step) => acc + (parseInt(step.match(/\d+/)?.[0] || '0', 10)), 0), [steps]);
  const stepDurations = useMemo(() => steps.map(step => parseInt(step.match(/\d+/)?.[0] || '0', 10)), [steps]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      setCountdown(stepDurations[currentStep]);
      interval = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            setCurrentStep(prevStep => (prevStep + 1) % steps.length);
            setCountdown(stepDurations[(currentStep + 1) % steps.length]);
            return stepDurations[(currentStep + 1) % steps.length];
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStep, steps, stepDurations]);

  const handleToggle = () => {
    setIsActive(!isActive);
    if (isActive) {
      setCurrentStep(0);
      setCountdown(0);
    }
  };
  
  const currentStepDuration = stepDurations[currentStep];
  const progress = isActive ? ((currentStepDuration - countdown) / currentStepDuration) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-48 flex flex-col items-center justify-center space-y-4">
        {isActive ? (
          <>
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-secondary"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className="stroke-current text-primary transition-all duration-1000 linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold">{countdown}</span>
                 <span className="text-sm text-muted-foreground">{steps[currentStep]}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Press start to begin the exercise.</p>
            <p className="text-sm">Total cycle: {totalDuration} seconds.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleToggle} className="w-full">
          {isActive ? 'Stop Exercise' : 'Start Exercise'}
        </Button>
      </CardFooter>
    </Card>
  );
}
