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
      radius: 160,
    };

    // Generate small crisp orange and black dots
    const dotCount = Math.min(110, Math.floor((width * height) / 13000));
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      const isOrange = i % 2 === 0;
      const baseRadius = Math.random() * 1.4 + 1.1; // Small 1.1px - 2.5px micro-dots

      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseRadius,
        isOrange,
        color: isOrange ? 'rgba(255, 107, 0, 0.80)' : 'rgba(15, 23, 42, 0.65)',
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e) => {
      const normX = e.clientX / window.innerWidth;
      const normY = e.clientY / window.innerHeight;

      // Sync CSS variables to root
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

      // 1. Connecting Lines between Nearby Dots
      const maxDist = 105;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.14;
            const isMixed = dots[i].isOrange !== dots[j].isOrange;

            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = isMixed
              ? `rgba(255, 122, 26, ${alpha})`
              : dots[i].isOrange
              ? `rgba(255, 107, 0, ${alpha * 1.1})`
              : `rgba(15, 23, 42, ${alpha * 0.75})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 2. Update & Draw Dynamic Orange & Black Dots (Clean & Crisp, No Cursor Glow)
      dots.forEach((dot) => {
        // Ambient natural drift
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap around viewport edges
        if (dot.x < -15) dot.x = width + 15;
        if (dot.x > width + 15) dot.x = -15;
        if (dot.y < -15) dot.y = height + 15;
        if (dot.y > height + 15) dot.y = -15;

        // Interactive Cursor Movement Physics
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        let activeRadius = dot.baseRadius;
        let fillStyle = dot.color;

        if (distToMouse < mouse.radius && distToMouse > 0) {
          const proximity = 1 - distToMouse / mouse.radius;
          const pushForce = proximity * 2.5;

          // Interactive push away from moving cursor
          dot.x -= (dx / distToMouse) * pushForce;
          dot.y -= (dy / distToMouse) * pushForce;

          // Slight size shift near cursor
          activeRadius = dot.baseRadius + proximity * 1.2;

          if (dot.isOrange) {
            fillStyle = `rgba(255, 107, 0, ${0.85 + proximity * 0.15})`;
          } else {
            fillStyle = `rgba(15, 23, 42, ${0.75 + proximity * 0.2})`;
          }
        } else {
          // Micro breathing oscillation
          const pulse = Math.sin(time * 2 + dot.pulseOffset) * 0.15 + 1;
          activeRadius = dot.baseRadius * pulse;
        }

        // Draw Crisp Micro Dot
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
      {/* Soft Static Ambient Floating Color Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-orange-400/8 via-amber-300/5 to-transparent blur-[120px] animate-float-slow transform-gpu"></div>
      
      <div className="absolute top-[40%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-slate-900/4 via-orange-400/4 to-transparent blur-[120px] animate-float-reverse transform-gpu"></div>

      {/* Interactive Canvas with Clean Orange & Black Dots */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-75" />

      {/* Subtle Dot Matrix Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.8px,transparent_0.8px)] [background-size:30px_30px] opacity-15"></div>
    </div>
  );
}
