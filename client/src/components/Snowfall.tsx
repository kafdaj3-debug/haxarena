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

    // Kar tanelerini oluştur - Optimize edilmiş sayı
    const createSnowflakes = () => {
      // Kar tanesi sayısını azalt (performans için)
      const maxCount = 50; // Maksimum 50 kar tanesi
      const screenBasedCount = Math.floor((canvas.width * canvas.height) / 40000);
      const count = Math.min(maxCount, screenBasedCount);
      snowflakesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1, // Biraz daha küçük
        speed: Math.random() * 1.2 + 0.8, // Daha hızlı
        opacity: Math.random() * 0.4 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03, // Daha yavaş dönüş
      }));
    };

    createSnowflakes();

    const drawSnowflake = (snowflake: Snowflake) => {
      ctx.save();
      ctx.translate(snowflake.x, snowflake.y);
      ctx.rotate(snowflake.rotation);
      ctx.globalAlpha = snowflake.opacity;
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 0.5; // Daha ince çizgi
      ctx.shadowBlur = 4; // Daha az blur (performans için)
      ctx.shadowColor = "rgba(255, 255, 255, 0.7)";

      // Basitleştirilmiş kar tanesi şekli (performans için)
      const size = snowflake.size;
      const radius = size;

      // Basit çember şeklinde kar tanesi (daha hızlı)
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // 6 kollu basit yıldız şekli
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * radius * 1.5;
        const y = Math.sin(angle) * radius * 1.5;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakesRef.current.forEach((snowflake) => {
        // Kar tanesini hareket ettir - Optimize edilmiş
        snowflake.y += snowflake.speed * 0.8; // Biraz daha hızlı
        snowflake.x += Math.sin(snowflake.y * 0.005) * 0.3; // Daha az yan yana hareket
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

