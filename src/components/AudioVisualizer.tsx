import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  accentColor = '#38bdf8',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 48;
    let barHeights = new Array(bars).fill(6);
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bars) * 0.65;
      const gap = (width / bars) * 0.35;

      phase += 0.08;

      for (let i = 0; i < bars; i++) {
        let targetHeight = 6;
        if (isPlaying) {
          // Dynamic wave shape calculation
          const wave1 = Math.sin(phase + i * 0.25) * 0.5 + 0.5;
          const wave2 = Math.cos(phase * 1.5 + i * 0.4) * 0.5 + 0.5;
          const centerWeight = 1 - Math.abs(i - bars / 2) / (bars / 2);
          targetHeight = 8 + (wave1 * 0.6 + wave2 * 0.4) * (height - 18) * Math.max(0.3, centerWeight);
        }

        // Smooth damping
        barHeights[i] += (targetHeight - barHeights[i]) * 0.25;

        const x = i * (barWidth + gap) + gap / 2;
        const currentH = barHeights[i];
        const y = (height - currentH) / 2;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + currentH);
        grad.addColorStop(0, accentColor);
        grad.addColorStop(1, '#6366f1');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, currentH, [3, 3, 3, 3]);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, accentColor]);

  return (
    <div className="w-full h-16 bg-slate-900/80 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={400}
        height={56}
        className="w-full h-full block"
      />
    </div>
  );
};
