'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

export function HeroNeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = media.matches;

    let animationFrame = 0;
    let particles: Particle[] = [];

    const buildParticles = (width: number, height: number) => {
      const area = width * height;
      const count = Math.min(34, Math.max(14, Math.floor(area / 28000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14,
        size: 1.2 + Math.random() * 2.8,
      }));
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(bounds.width * dpr);
      canvas.height = Math.floor(bounds.height * dpr);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      buildParticles(bounds.width, bounds.height);
    };

    const drawBackdrop = (width: number, height: number, phase: number) => {
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
      gradient.addColorStop(0.45, 'rgba(247,249,252,0.76)');
      gradient.addColorStop(1, 'rgba(238,242,247,0.54)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const glowA = context.createRadialGradient(width * 0.2, height * 0.15, 0, width * 0.2, height * 0.15, width * 0.42);
      glowA.addColorStop(0, 'rgba(242,209,107,0.18)');
      glowA.addColorStop(1, 'rgba(242,209,107,0)');
      context.fillStyle = glowA;
      context.fillRect(0, 0, width, height);

      const glowB = context.createRadialGradient(width * 0.82, height * 0.22, 0, width * 0.82, height * 0.22, width * 0.38);
      glowB.addColorStop(0, 'rgba(27,42,65,0.18)');
      glowB.addColorStop(1, 'rgba(27,42,65,0)');
      context.fillStyle = glowB;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      for (let i = 0; i < 3; i += 1) {
        const offset = i * 24;
        context.moveTo(-40, height * (0.64 + i * 0.04));
        context.bezierCurveTo(
          width * 0.18,
          height * (0.54 + Math.sin(phase + i) * 0.04) + offset,
          width * 0.54,
          height * (0.72 + Math.cos(phase + i * 0.6) * 0.05) - offset,
          width + 40,
          height * (0.56 + i * 0.03)
        );
      }
      context.strokeStyle = 'rgba(212,175,55,0.11)';
      context.lineWidth = 1;
      context.stroke();
    };

    const draw = (time: number) => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const phase = time * 0.00022;

      context.clearRect(0, 0, width, height);
      drawBackdrop(width, height, phase);

      for (const particle of particles) {
        particle.x += isReducedMotion ? 0 : particle.vx;
        particle.y += isReducedMotion ? 0 : particle.vy;

        if (particle.x < -24) particle.x = width + 24;
        if (particle.x > width + 24) particle.x = -24;
        if (particle.y < -24) particle.y = height + 24;
        if (particle.y > height + 24) particle.y = -24;
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 132) {
            const opacity = 1 - distance / 132;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(58, 74, 99, ${opacity * 0.16})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = 'rgba(27, 42, 65, 0.18)';
        context.fill();

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 0.42, 0, Math.PI * 2);
        context.fillStyle = 'rgba(212, 175, 55, 0.56)';
        context.fill();
      }

      if (!isReducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (isReducedMotion) {
      draw(0);
    } else {
      animationFrame = window.requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.56),rgba(255,255,255,0.18))] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
