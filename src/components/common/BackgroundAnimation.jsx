import React, { useEffect, useRef } from 'react';

export function BackgroundAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with gentle smoothing
    let mouse = { x: width / 2, y: height / 3, targetX: width / 2, targetY: height / 3 };

    // Subtle Node Beacons (low quantity, gentle movement)
    const beaconCount = 18;
    const beacons = [];
    const colorPalette = [
      { core: 'rgba(255, 107, 0, 0.45)', glow: 'rgba(255, 107, 0, 0.08)' },
      { core: 'rgba(255, 149, 0, 0.35)', glow: 'rgba(255, 149, 0, 0.06)' },
      { core: 'rgba(14, 165, 233, 0.35)', glow: 'rgba(14, 165, 233, 0.06)' },
      { core: 'rgba(139, 92, 246, 0.3)', glow: 'rgba(139, 92, 246, 0.05)' },
    ];

    for (let i = 0; i < beaconCount; i++) {
      const col = colorPalette[i % colorPalette.length];
      beacons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseRadius: Math.random() * 2 + 1.2,
        color: col.core,
        glowColor: col.glow,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    // Soft Harmonic Energy Waves (very low contrast)
    const waveDefs = [
      { amplitude: 35, frequency: 0.0018, speed: 0.008, yOffsetRatio: 0.25, color: 'rgba(255, 107, 0, 0.07)' },
      { amplitude: 45, frequency: 0.0012, speed: -0.006, yOffsetRatio: 0.55, color: 'rgba(14, 165, 233, 0.06)' },
      { amplitude: 40, frequency: 0.0016, speed: 0.009, yOffsetRatio: 0.80, color: 'rgba(255, 149, 0, 0.05)' },
    ];

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.8;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // 1. Ultra-subtle Mouse Ambient Spotlight
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320);
      mouseGrad.addColorStop(0, 'rgba(255, 122, 26, 0.04)');
      mouseGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.015)');
      mouseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Flowing Ambient Waves
      waveDefs.forEach((wave) => {
        const baseY = height * wave.yOffsetRatio;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 16) {
          const y = baseY + 
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.cos(x * 0.0008 + time * 0.004) * (wave.amplitude * 0.3);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 3. Gentle Connection Lines between Close Beacons
      const maxDist = 140;
      for (let i = 0; i < beacons.length; i++) {
        for (let j = i + 1; j < beacons.length; j++) {
          const dx = beacons[i].x - beacons[j].x;
          const dy = beacons[i].y - beacons[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(beacons[i].x, beacons[i].y);
            ctx.lineTo(beacons[j].x, beacons[j].y);
            ctx.strokeStyle = `rgba(255, 122, 26, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 4. Subtle Drifting Beacons
      beacons.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > width) b.vx *= -1;
        if (b.y < 0 || b.y > height) b.vy *= -1;

        const pulse = Math.sin(time * 0.025 + b.pulseOffset) * 0.25 + 0.85;
        const radius = b.baseRadius * pulse;

        // Subtle glow ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = b.glowColor;
        ctx.fill();

        // Tiny core
        ctx.beginPath();
        ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Soft Ambient Ethereal Glow (Ultra Subtle) */}
      <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-orange-400/8 via-amber-300/5 to-transparent blur-[120px] animate-float-slow transform-gpu"></div>
      
      <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-sky-400/6 via-orange-300/4 to-transparent blur-[120px] animate-float-reverse transform-gpu"></div>
      
      <div className="absolute -bottom-[10%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-brand-500/6 via-purple-300/4 to-transparent blur-[120px] animate-pulse-slow transform-gpu"></div>

      {/* Subtle Canvas Animation (Low Opacity, Clean & Non-Intrusive) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Very Soft Dot Matrix Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.8px,transparent_0.8px)] [background-size:32px_32px] opacity-15"></div>
    </div>
  );
}
