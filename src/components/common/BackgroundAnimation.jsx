import React, { useEffect, useRef } from 'react';

export function BackgroundAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with gentle smoothing & CSS variable sync
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 175,
      isHovered: true,
    };

    // Generate small orange and black dots
    const dotCount = Math.min(100, Math.floor((width * height) / 14000));
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      const isOrange = i % 2 === 0;
      const baseRadius = Math.random() * 1.6 + 1.2; // Small 1.2px - 2.8px dots

      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        baseRadius,
        currentRadius: baseRadius,
        isOrange,
        color: isOrange ? 'rgba(255, 107, 0, 0.85)' : 'rgba(15, 23, 42, 0.70)',
        glowColor: isOrange ? 'rgba(255, 107, 0, 0.25)' : 'rgba(15, 23, 42, 0.12)',
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e) => {
      const normX = e.clientX / window.innerWidth;
      const normY = e.clientY / window.innerHeight;

      // Sync CSS variables to root as requested
      root.style.setProperty('--mouse-x', normX.toFixed(4));
      root.style.setProperty('--mouse-y', normY.toFixed(4));

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
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Dynamic Cursor Spotlight Glow
      const spotGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 280);
      spotGrad.addColorStop(0, 'rgba(255, 107, 0, 0.06)');
      spotGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.02)');
      spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Connecting Lines between Nearby Dots
      const maxDist = 110;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            const isMixed = dots[i].isOrange !== dots[j].isOrange;

            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = isMixed
              ? `rgba(255, 122, 26, ${alpha})`
              : dots[i].isOrange
              ? `rgba(255, 107, 0, ${alpha * 1.2})`
              : `rgba(15, 23, 42, ${alpha * 0.8})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // 3. Update & Draw Dynamic Orange & Black Dots
      dots.forEach((dot) => {
        // Natural ambient drift
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap or bounce around edges
        if (dot.x < -20) dot.x = width + 20;
        if (dot.x > width + 20) dot.x = -20;
        if (dot.y < -20) dot.y = height + 20;
        if (dot.y > height + 20) dot.y = -20;

        // Interactive Cursor Physics
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        let activeRadius = dot.baseRadius;
        let fillStyle = dot.color;
        let glowRadius = 0;

        if (distToMouse < mouse.radius) {
          const proximity = 1 - distToMouse / mouse.radius;
          const pushForce = proximity * 2.8;

          // Interactive push/orbit away from moving cursor
          dot.x -= (dx / distToMouse) * pushForce;
          dot.y -= (dy / distToMouse) * pushForce;

          // Dynamic size and glow changes with cursor
          activeRadius = dot.baseRadius + proximity * 2.2;
          glowRadius = activeRadius * 2.5;

          if (dot.isOrange) {
            fillStyle = `rgba(255, 107, 0, ${0.85 + proximity * 0.15})`;
          } else {
            // Dark dots transition to warm amber-tinted slate near cursor
            fillStyle = `rgba(${Math.round(15 + proximity * 180)}, ${Math.round(23 + proximity * 60)}, ${Math.round(42 - proximity * 20)}, ${0.75 + proximity * 0.2})`;
          }
        } else {
          // Subtle natural breathing pulse
          const pulse = Math.sin(time * 2 + dot.pulseOffset) * 0.2 + 1;
          activeRadius = dot.baseRadius * pulse;
        }

        // Draw Dot Glow (if close to cursor or pulsing orange)
        if (glowRadius > 0 || dot.isOrange) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, glowRadius || activeRadius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = dot.glowColor;
          ctx.fill();
        }

        // Draw Small Dot Core
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.8, activeRadius), 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
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
      {/* CSS-Variable-driven dynamic radial spotlight tracking the cursor */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 opacity-60 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle 600px at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), rgba(255, 107, 0, 0.045) 0%, rgba(15, 23, 42, 0.015) 45%, transparent 70%)`
        }}
      />

      {/* Ambient Floating Color Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-orange-400/10 via-amber-300/6 to-transparent blur-[120px] animate-float-slow transform-gpu"></div>
      
      <div className="absolute top-[40%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-slate-900/5 via-orange-400/5 to-transparent blur-[120px] animate-float-reverse transform-gpu"></div>

      {/* Interactive Canvas with Small Orange & Black Dots */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* Subtle Dot Matrix Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.9px,transparent_0.9px)] [background-size:30px_30px] opacity-20"></div>
    </div>
  );
}
