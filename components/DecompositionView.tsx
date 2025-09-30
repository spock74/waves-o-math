import React, { useRef, useEffect, useMemo } from 'react';
import { WaveType } from './FourierCanvas';

interface DecompositionViewProps {
  order: number;
  waveType: WaveType;
  speed: number;
}

// --- Layout Constants ---
const ROW_HEIGHT = 80; // Fixed height for each component wave row
const RESULT_AREA_HEIGHT = 166; // Fixed height for the bottom result panel
const LEFT_LABEL_WIDTH = 60; // Space for 'k=...' labels
const RIGHT_LABEL_WIDTH = 100; // Space for 'Freq/Amp' labels
const WAVE_PADDING = 15; // Horizontal padding for the wave animation

const DecompositionView: React.FC<DecompositionViewProps> = ({ order, waveType, speed }) => {
  const componentsCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const componentsContainerRef = useRef<HTMLDivElement>(null);

  const animationFrameId = useRef<number | null>(null);
  const time = useRef(0);
  
  // Pre-calculate wave parameters for efficiency. This only re-runs when order or waveType changes.
  const waveParams = useMemo(() => {
    const params = [];
    for (let k = 0; k < order; k++) {
        let n: number, pureAmplitude: number;
        switch (waveType) {
            case 'sawtooth':
                n = k + 1;
                pureAmplitude = (2 / (n * Math.PI)) * Math.pow(-1, n + 1);
                break;
            case 'triangular':
                n = 2 * k + 1;
                pureAmplitude = (8 / (Math.pow(Math.PI, 2))) * (Math.pow(-1, k) / Math.pow(n, 2));
                break;
            case 'square':
            default:
                n = 2 * k + 1;
                pureAmplitude = (4 / (n * Math.PI));
                break;
        }
        params.push({ n, pureAmplitude });
    }
    return params;
  }, [order, waveType]);

  useEffect(() => {
    const componentsCanvas = componentsCanvasRef.current;
    const resultCanvas = resultCanvasRef.current;
    const componentsContainer = componentsContainerRef.current;
    if (!componentsCanvas || !resultCanvas || !componentsContainer) return;

    const resizeCanvases = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = componentsContainer.getBoundingClientRect();
        
        // Resize components canvas
        componentsCanvas.width = rect.width * dpr;
        componentsCanvas.height = order * ROW_HEIGHT * dpr;
        componentsCanvas.style.height = `${order * ROW_HEIGHT}px`;
        const cCtx = componentsCanvas.getContext('2d');
        if (cCtx) cCtx.scale(dpr, dpr);

        // Resize result canvas
        resultCanvas.width = rect.width * dpr;
        resultCanvas.height = RESULT_AREA_HEIGHT * dpr;
        const rCtx = resultCanvas.getContext('2d');
        if (rCtx) rCtx.scale(dpr, dpr);
    };
    
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    const animate = () => {
      const cCtx = componentsCanvas.getContext('2d');
      const rCtx = resultCanvas.getContext('2d');
      if (!cCtx || !rCtx) return;

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = componentsCanvas.width / dpr;
      
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f472b6', '#60a5fa', '#a78bfa', '#facc15'];

      cCtx.clearRect(0, 0, logicalWidth, order * ROW_HEIGHT);
      rCtx.clearRect(0, 0, logicalWidth, RESULT_AREA_HEIGHT);
      
      // Define drawing areas based on layout constants
      const waveStartX = LEFT_LABEL_WIDTH + WAVE_PADDING;
      const waveEndX = logicalWidth - RIGHT_LABEL_WIDTH - WAVE_PADDING;
      const waveLength = waveEndX - waveStartX;

      const maxTheoreticalAmp = 4 / Math.PI; 
      const componentScale = (ROW_HEIGHT / 2) * 0.85 / maxTheoreticalAmp;

      const wavePath: number[][] = Array(order).fill(0).map(() => []);
      const summedWavePath: number[] = [];
      
      for (let i = 0; i < waveLength; i++) {
        const t = time.current + (i - waveLength) * 0.01;
        let totalY = 0;
        
        for (let k = 0; k < order; k++) {
            const params = waveParams[k];
            const y = params.pureAmplitude * Math.sin(params.n * t);
            wavePath[k][i] = y;
            totalY += y;
        }
        summedWavePath[i] = totalY;
      }

      // Draw individual component waves
      for (let k = 0; k < order; k++) {
        const centerY = (k * ROW_HEIGHT) + (ROW_HEIGHT / 2);
        const params = waveParams[k];
        
        // Draw center line
        cCtx.beginPath();
        cCtx.strokeStyle = '#4b5563';
        cCtx.setLineDash([2, 3]);
        cCtx.moveTo(waveStartX, centerY);
        cCtx.lineTo(waveEndX, centerY);
        cCtx.stroke();
        cCtx.setLineDash([]);
        
        // Draw wave
        cCtx.strokeStyle = colors[k % colors.length];
        cCtx.lineWidth = 2;
        cCtx.beginPath();
        cCtx.moveTo(waveStartX, centerY + wavePath[k][0] * componentScale);
        for (let i = 1; i < waveLength; i++) {
            cCtx.lineTo(waveStartX + i, centerY + wavePath[k][i] * componentScale);
        }
        cCtx.stroke();
        
        // Draw Left Label
        cCtx.fillStyle = '#e5e7eb';
        cCtx.font = 'bold 14px sans-serif';
        cCtx.textAlign = 'center';
        const kLabel = waveType === 'sawtooth' ? k + 1 : k;
        cCtx.fillText(`k = ${kLabel}`, LEFT_LABEL_WIDTH / 2, centerY);

        // Draw Right Labels
        cCtx.fillStyle = '#9ca3af';
        cCtx.font = '14px sans-serif';
        cCtx.textAlign = 'center';
        cCtx.fillText(`Freq: ${params.n}`, logicalWidth - RIGHT_LABEL_WIDTH / 2, centerY - 10);
        cCtx.fillText(`Amp: ${params.pureAmplitude.toFixed(3)}`, logicalWidth - RIGHT_LABEL_WIDTH / 2, centerY + 15);
      }
      
      const resultCenterY = RESULT_AREA_HEIGHT / 2;
      const maxAbsY = summedWavePath.reduce((max, y) => Math.max(max, Math.abs(y)), 0);
      const resultScale = maxAbsY > 0 ? (resultCenterY * 0.85) / maxAbsY : 1; 

      // Draw the scaled summed wave
      rCtx.strokeStyle = '#fde68a';
      rCtx.lineWidth = 3;
      rCtx.beginPath();
      rCtx.moveTo(waveStartX, resultCenterY + summedWavePath[0] * resultScale);
      for (let i = 1; i < waveLength; i++) {
        rCtx.lineTo(waveStartX + i, resultCenterY + summedWavePath[i] * resultScale);
      }
      rCtx.stroke();
      
      // Draw Result Left Label
      rCtx.fillStyle = '#f3f4f6';
      rCtx.font = 'bold 16px sans-serif';
      rCtx.textAlign = 'center';
      rCtx.fillText('Resultado', LEFT_LABEL_WIDTH / 2, resultCenterY);

      // Draw Result Right Labels
      rCtx.fillStyle = '#9ca3af';
      rCtx.font = '14px sans-serif';
      rCtx.textAlign = 'center';
      const fundamentalFreq = waveParams.length > 0 ? waveParams[0].n : 1;
      rCtx.fillText(`Freq: ${fundamentalFreq}`, logicalWidth - RIGHT_LABEL_WIDTH / 2, resultCenterY - 10);
      rCtx.fillText(`Amp: ${maxAbsY.toFixed(3)}`, logicalWidth - RIGHT_LABEL_WIDTH / 2, resultCenterY + 15);


      time.current -= 0.025 * speed; // Negative increment moves wave right-to-left
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvases);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [order, waveType, speed, waveParams]);

  return (
    <div className="flex flex-col" style={{ height: '500px' }}>
      <div 
        ref={componentsContainerRef} 
        className="flex-grow overflow-y-auto"
        aria-label="Contêiner rolável para as ondas componentes"
      >
        <canvas 
          ref={componentsCanvasRef} 
          className="w-full"
          aria-label="Animação das ondas componentes da série de Fourier"
        />
      </div>
      <div 
        className="flex-shrink-0 bg-gray-800/50 border-t-2 border-gray-700"
        style={{ height: `${RESULT_AREA_HEIGHT}px` }}
        aria-label="Contêiner para a onda somada final"
      >
        <canvas 
          ref={resultCanvasRef} 
          className="w-full h-full"
          aria-label="Animação da onda resultante somada final"
        />
      </div>
    </div>
  );
};

export default DecompositionView;