import React, { type FC, useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface ParticlesProps {
  trigger: boolean;
  count: number;
  duration: number;
  x?: number;
  y?: number;
  colors?: string[];
}

export const Particles: FC<ParticlesProps> = ({
  trigger,
  count = 30,
  duration = 1000,
  x = window.innerWidth / 2,
  y = window.innerHeight / 2,
  colors = ['#A78BFA', '#818CF8', '#38BDF8', '#FB7185', '#F472B6']
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastTimestampRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Create particle explosion
  useEffect(() => {
    if (!trigger) return;

    // Clear any existing particles
    setParticles([]);
    durationRef.current = 0;

    // Generate new particles
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Random angle for particle direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;

      newParticles.push({
        id: i,
        x,
        y,
        size: 3 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    setParticles(newParticles);
  }, [trigger, count, x, y, colors]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      durationRef.current += deltaTime;

      // Calculate progress (0 to 1)
      const progress = Math.min(durationRef.current / duration, 1);

      // Update particle positions
      setParticles(prevParticles =>
        prevParticles.map(p => ({
          ...p,
          x: p.x + p.speedX,
          y: p.y + p.speedY,
          speedY: p.speedY + 0.05, // Add gravity
          opacity: 1 - progress,
          rotation: p.rotation + p.rotationSpeed,
          size: p.size * (1 - progress * 0.5) // Particles get slightly smaller
        }))
      );

      // Continue animation if duration hasn't been reached
      if (durationRef.current < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Clear particles when animation is done
        setParticles([]);
        lastTimestampRef.current = 0;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, duration]);

  // Don't render if no particles
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            borderRadius: '50%',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
            transition: 'opacity 0.1s ease-out'
          }}
        />
      ))}
    </div>
  );
};
