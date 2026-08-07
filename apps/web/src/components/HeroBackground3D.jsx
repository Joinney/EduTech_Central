import React, { useEffect, useRef } from "react";

export default function HeroBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1920&auto=format&fit=crop";

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 220,
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const spheres = [
      { x: width * 0.12, y: height * 0.78, z: 1.4, r: 105, isBlue: true, icon: "brain", vx: 0.1, vy: -0.08, pulse: 0 },
      { x: width * 0.88, y: height * 0.70, z: 1.6, r: 135, isBlue: false, icon: "cap", vx: -0.08, vy: 0.1, pulse: 1 },
      { x: width * 0.65, y: height * 0.25, z: 1.2, r: 85, isBlue: false, icon: "bulb", vx: 0.08, vy: 0.08, pulse: 2 },
      { x: width * 0.18, y: height * 0.22, z: 0.9, r: 60, isBlue: true, icon: "book", vx: -0.1, vy: -0.08, pulse: 3 },
    ];

    const drawGlowDot = (x, y, color = "#00f0ff") => {
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawSphereIcon = (type, cx, cy, radius) => {
      ctx.save();
      ctx.translate(cx, cy);
      const scale = radius / 90;
      ctx.scale(scale, scale);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 15;

      if (type === "brain") {
        ctx.beginPath();
        ctx.moveTo(-25, -5);
        ctx.bezierCurveTo(-35, -25, -10, -35, -5, -20);
        ctx.bezierCurveTo(0, -35, 25, -35, 20, -15);
        ctx.bezierCurveTo(35, -15, 35, 10, 20, 20);
        ctx.bezierCurveTo(15, 35, -15, 35, -20, 20);
        ctx.bezierCurveTo(-35, 15, -35, -5, -25, -5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-15, -5); ctx.lineTo(-5, -5); ctx.lineTo(0, -15);
        ctx.moveTo(5, 5); ctx.lineTo(15, 5); ctx.lineTo(15, -10);
        ctx.moveTo(-10, 15); ctx.lineTo(0, 15); ctx.lineTo(5, 25);
        ctx.stroke();

        drawGlowDot(0, -15);
        drawGlowDot(15, -10);
        drawGlowDot(5, 25);
      } else if (type === "cap") {
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(32, -10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-32, -10);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-20, -2);
        ctx.lineTo(-20, 15);
        ctx.bezierCurveTo(-15, 26, 15, 26, 20, 15);
        ctx.lineTo(20, -2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(22, -6);
        ctx.lineTo(28, 10);
        ctx.stroke();
        drawGlowDot(28, 10, "#ffaa00");
        drawGlowDot(0, -25, "#00f0ff");
      } else if (type === "bulb") {
        ctx.beginPath();
        ctx.arc(0, -10, 22, 0.22 * Math.PI, 0.78 * Math.PI, true);
        ctx.bezierCurveTo(12, 10, 10, 16, 10, 20);
        ctx.lineTo(-10, 20);
        ctx.bezierCurveTo(-10, 16, -12, 10, -22, -10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-8, 25); ctx.lineTo(8, 25);
        ctx.moveTo(-6, 30); ctx.lineTo(6, 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-6, 5); ctx.lineTo(-3, -8); ctx.lineTo(0, 0); ctx.lineTo(3, -8); ctx.lineTo(6, 5);
        ctx.stroke();
        drawGlowDot(0, -32, "#ffaa00");
      } else if (type === "book") {
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.bezierCurveTo(-12, -22, -28, -18, -32, -12);
        ctx.lineTo(-32, 15);
        ctx.bezierCurveTo(-28, 10, -12, 6, 0, 12);
        ctx.bezierCurveTo(12, 6, 28, 10, 32, 15);
        ctx.lineTo(32, -12);
        ctx.bezierCurveTo(28, -18, 12, -22, 0, -15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(0, 12);
        ctx.stroke();

        drawGlowDot(-32, -12);
        drawGlowDot(32, -12);
        drawGlowDot(0, -15);
      }

      ctx.restore();
    };

    const nodesCount = Math.floor((width * height) / 5000);
    const nodes = [];
    const nodeColors = ["#00f0ff", "#38bdf8", "#ff9100", "#ffaa00", "#ffffff"];

    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        baseR: Math.random() * 3 + 1.5,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        glow: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      if (bgImage.complete && bgImage.naturalWidth !== 0) {
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.drawImage(bgImage, 0, 0, width, height);
        ctx.restore();
      }

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "rgba(0, 82, 212, 0.45)");
      bgGrad.addColorStop(0.4, "rgba(0, 114, 255, 0.35)");
      bgGrad.addColorStop(0.7, "rgba(245, 124, 0, 0.40)");
      bgGrad.addColorStop(1, "rgba(221, 44, 0, 0.50)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      spheres.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.pulse += 0.02;

        if (s.x - s.r < -20 || s.x + s.r > width + 20) s.vx *= -1;
        if (s.y - s.r < -20 || s.y + s.r > height + 20) s.vy *= -1;

        const px = s.x + (mouse.x - width / 2) * 0.035 * s.z;
        const py = s.y + (mouse.y - height / 2) * 0.035 * s.z;
        const currentR = s.r + Math.sin(s.pulse) * 3.5;

        const auraGrad = ctx.createRadialGradient(px, py, currentR * 0.6, px, py, currentR * 2.2);
        auraGrad.addColorStop(0, s.isBlue ? "rgba(0, 240, 255, 0.5)" : "rgba(255, 145, 0, 0.55)");
        auraGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(px, py, currentR * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        const sphereGrad = ctx.createRadialGradient(
          px - currentR * 0.35,
          py - currentR * 0.35,
          currentR * 0.05,
          px,
          py,
          currentR
        );

        if (s.isBlue) {
          sphereGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          sphereGrad.addColorStop(0.3, "rgba(128, 216, 255, 0.85)");
          sphereGrad.addColorStop(0.7, "rgba(0, 145, 234, 0.80)");
          sphereGrad.addColorStop(1, "rgba(0, 41, 132, 0.90)");
        } else {
          sphereGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          sphereGrad.addColorStop(0.3, "rgba(255, 209, 128, 0.85)");
          sphereGrad.addColorStop(0.7, "rgba(255, 109, 0, 0.80)");
          sphereGrad.addColorStop(1, "rgba(221, 44, 0, 0.90)");
        }

        ctx.beginPath();
        ctx.arc(px, py, currentR, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();

        drawSphereIcon(s.icon, px, py, currentR);
      });

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.glow += 0.03;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const nx = n.x + (mouse.x - width / 2) * 0.018 * n.z;
        const ny = n.y + (mouse.y - height / 2) * 0.018 * n.z;

        const dxMouse = mouse.x - nx;
        const dyMouse = mouse.y - ny;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius) {
          const force = 1 - distMouse / mouse.radius;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${force * 0.95})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        const r = n.baseR + Math.sin(n.glow) * 0.8;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const n2x = n2.x + (mouse.x - width / 2) * 0.018 * n2.z;
          const n2y = n2.y + (mouse.y - height / 2) * 0.018 * n2.z;

          const dx = nx - n2x;
          const dy = ny - n2y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(n2x, n2y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 135) * 0.55})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
    />
  );
}