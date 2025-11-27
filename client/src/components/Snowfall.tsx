import { useEffect, useRef } from "react";

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Kar tanelerini oluştur
    const createSnowflakes = () => {
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      snowflakesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      }));
    };

    createSnowflakes();

    const drawSnowflake = (snowflake: Snowflake) => {
      ctx.save();
      ctx.translate(snowflake.x, snowflake.y);
      ctx.rotate(snowflake.rotation);
      ctx.globalAlpha = snowflake.opacity;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";

      // Basit kar tanesi şekli
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x1 = Math.cos(angle) * snowflake.size;
        const y1 = Math.sin(angle) * snowflake.size;
        const x2 = Math.cos(angle) * snowflake.size * 0.5;
        const y2 = Math.sin(angle) * snowflake.size * 0.5;

        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
        ctx.moveTo(x1, y1);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((snowflake) => {
        // Kar tanesini hareket ettir
        snowflake.y += snowflake.speed;
        snowflake.x += Math.sin(snowflake.y * 0.01) * 0.5; // Hafif yan yana hareket
        snowflake.rotation += snowflake.rotationSpeed;

        // Ekranın dışına çıktıysa yukarıdan başlat
        if (snowflake.y > canvas.height) {
          snowflake.y = -10;
          snowflake.x = Math.random() * canvas.width;
        }

        // Ekranın yanından çıktıysa
        if (snowflake.x < 0) {
          snowflake.x = canvas.width;
        } else if (snowflake.x > canvas.width) {
          snowflake.x = 0;
        }

        drawSnowflake(snowflake);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      style={{ background: "transparent" }}
    />
  );
}

