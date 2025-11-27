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
      const count = Math.floor((canvas.width * canvas.height) / 20000);
      snowflakesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1.5, // Biraz daha büyük kar taneleri
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.6, // Daha görünür
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05, // Daha yavaş dönüş
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
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";

      const size = snowflake.size;
      const branchLength = size * 2;
      const branchWidth = size * 0.3;

      // Gerçekçi kar tanesi şekli - 6 kollu simetrik yapı
      ctx.beginPath();
      
      // Her kol için (6 kol)
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Ana kol (merkezden dışa)
        const x1 = cos * branchLength;
        const y1 = sin * branchLength;

        // İlk dallanma noktası
        const branch1X = cos * (branchLength * 0.6);
        const branch1Y = sin * (branchLength * 0.6);
        
        // İkinci dallanma noktası
        const branch2X = cos * (branchLength * 0.3);
        const branch2Y = sin * (branchLength * 0.3);

        // Ana kol çizgisi
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, y1);

        // Yan dallar (her kolun iki yanında)
        const sideAngle1 = angle + Math.PI / 6;
        const sideAngle2 = angle - Math.PI / 6;
        
        // İlk yan dallar (uzun)
        const side1X = branch1X + Math.cos(sideAngle1) * (branchLength * 0.4);
        const side1Y = branch1Y + Math.sin(sideAngle1) * (branchLength * 0.4);
        const side2X = branch1X + Math.cos(sideAngle2) * (branchLength * 0.4);
        const side2Y = branch1Y + Math.sin(sideAngle2) * (branchLength * 0.4);

        ctx.moveTo(branch1X, branch1Y);
        ctx.lineTo(side1X, side1Y);
        ctx.moveTo(branch1X, branch1Y);
        ctx.lineTo(side2X, side2Y);

        // İkinci yan dallar (kısa)
        const side3X = branch2X + Math.cos(sideAngle1) * (branchLength * 0.25);
        const side3Y = branch2Y + Math.sin(sideAngle1) * (branchLength * 0.25);
        const side4X = branch2X + Math.cos(sideAngle2) * (branchLength * 0.25);
        const side4Y = branch2Y + Math.sin(sideAngle2) * (branchLength * 0.25);

        ctx.moveTo(branch2X, branch2Y);
        ctx.lineTo(side3X, side3Y);
        ctx.moveTo(branch2X, branch2Y);
        ctx.lineTo(side4X, side4Y);
      }

      ctx.stroke();

      // Merkez nokta
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
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

