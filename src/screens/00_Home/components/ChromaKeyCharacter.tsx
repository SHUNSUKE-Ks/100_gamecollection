import React, { useEffect, useRef, useState } from 'react';
import type { Emotion } from '../types';

interface ChromaKeyCharacterProps {
  src: string;
  emotion: Emotion;
  onClick: () => void;
}

const ChromaKeyCharacter: React.FC<ChromaKeyCharacterProps> = ({ src, emotion, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;

    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 1024;

      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // --- CHROMA KEY LOGIC ---
      // Pixels with Green > 100 and Green dominant are set to transparent
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const l = frame.data.length;

      for (let i = 0; i < l; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];

        // Simple Green Screen Algorithm (Green is dominant significantly)
        if (g > 80 && g > r * 1.1 && g > b * 1.1) {
          frame.data[i + 3] = 0; // Set Alpha to 0
        }
      }
      ctx.putImageData(frame, 0, 0);
      setIsLoaded(true);
    };
  }, [src]);

  let animClass = "animate-float";
  if (emotion === 'biribiri') animClass = "animate-biribiri";
  if (emotion === 'surprised') animClass = "scale-105 transition-transform duration-100";
  if (emotion === 'super') animClass = "animate-bounce";
  if (emotion === 'nadelu_reaction') animClass = "animate-float scale-105";

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${animClass}`}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        className={`block mx-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[85vh] w-auto transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Emotion Overlays */}
      {emotion === 'biribiri' && (
        <div className="absolute inset-0 bg-yellow-400 mix-blend-overlay opacity-30 pointer-events-none rounded-full blur-3xl animate-pulse" />
      )}
      {emotion === 'super' && (
        <div className="absolute inset-0 bg-pink-400 mix-blend-overlay opacity-30 pointer-events-none rounded-full blur-3xl animate-ping" />
      )}
    </div>
  );
};

export default ChromaKeyCharacter;