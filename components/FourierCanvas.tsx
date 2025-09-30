import React, { useRef, useEffect } from 'react';

export type WaveType = 'square' | 'sawtooth' | 'triangular';

interface FourierCanvasProps {
  order: number;
  waveType: WaveType;
  speed: number;
}

const FourierCanvas: React.FC<FourierCanvasProps> = ({ order, waveType, speed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const time = useRef(0);
  const wavePath = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            canvas.width = rect.width * dpr;
            canvas.height = 500 * dpr; // Fixed height
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;
      
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f472b6', '#60a5fa', '#a78bfa', '#facc15'];

      ctx.fillStyle = 'rgba(17, 24, 39, 0)';
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      let x = logicalWidth * 0.3;
      let y = logicalHeight / 2;

      const waveStartX = logicalWidth * 0.55;
      const scaleFactor = logicalHeight / 5;

      for (let k = 0; k < order; k++) {
        const prevX = x;
        const prevY = y;

        let n: number;
        let radius: number;

        switch (waveType) {
          case 'sawtooth':
            n = k + 1;
            radius = (2 / (n * Math.PI)) * Math.pow(-1, n + 1) * scaleFactor * 1.5;
            break;
          case 'triangular':
            n = 2 * k + 1;
            radius = (8 / (Math.pow(Math.PI, 2))) * (Math.pow(-1, k) / Math.pow(n, 2)) * scaleFactor * 3;
            break;
          case 'square':
          default:
            n = 2 * k + 1;
            radius = (4 / (n * Math.PI)) * scaleFactor;
            break;
        }

        const angle = n * time.current;

        x += radius * Math.cos(angle);
        y += radius * Math.sin(angle);

        ctx.beginPath();
        ctx.strokeStyle = colors[k % colors.length] + '99';
        ctx.lineWidth = 2;
        ctx.arc(prevX, prevY, Math.abs(radius), 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#e5e7ebAA';
        ctx.lineWidth = 1;
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      wavePath.current.unshift(y);
      if (wavePath.current.length > logicalWidth - waveStartX) {
        wavePath.current.pop();
      }

      ctx.beginPath();
      ctx.strokeStyle = '#6b7280';
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, y);
      ctx.lineTo(waveStartX, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 3;
      ctx.moveTo(waveStartX, wavePath.current[0]);
      for (let i = 1; i < wavePath.current.length; i++) {
        ctx.lineTo(waveStartX + i, wavePath.current[i]);
      }
      ctx.stroke();

      time.current += 0.025 * speed;

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [order, waveType, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full"
      style={{ height: '500px' }}
      aria-label="Canvas de animação da série de Fourier"
    />
  );
};

export default FourierCanvas;