import { useEffect, useRef } from "react";

export default function CosmicGalaxyArt() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const shootingStars = [];
    const colors = ["#ff9ff3","#feca57","#5f27cd","#48dbfb","#1dd1a1","#ff6b6b"];

    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function createShootingStar() {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: 0,
        length: Math.random() * 80 + 10,
        speed: 6,
        angle: Math.PI / 4,
        opacity: 1
      });
    }

    function draw() {
      ctx.fillStyle = "rgba(5, 5, 30, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });

      shootingStars.forEach((s, index) => {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.01;
        ctx.strokeStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length, s.y - s.length);
        ctx.stroke();
        if (s.opacity <= 0) shootingStars.splice(index, 1);
      });
    }

    function animate() {
      draw();
      if (Math.random() < 0.005) createShootingStar();
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }} />
  );
}
