import React from 'react';
import { Heart } from 'lucide-react';

interface AffectionGaugeProps {
  value: number;
}

const AffectionGauge: React.FC<AffectionGaugeProps> = ({ value }) => {
  // Normalize value for bar (0-100)
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="flex flex-col gap-1 w-48 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/20">
      <div className="flex items-center justify-between text-white mb-1">
        <span className="text-sm font-bold tracking-widest text-pink-200">AFFECTION</span>
        <span className="text-xs text-pink-300">{value}%</span>
      </div>
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
        {/* Shine effect */}
        <div className="absolute top-0 left-0 h-1/2 w-full bg-white/20" />
      </div>
      <div className="flex justify-end mt-1">
         <Heart className={`w-4 h-4 ${value > 50 ? 'text-pink-500 fill-pink-500' : 'text-gray-400'} transition-colors duration-500`} />
      </div>
    </div>
  );
};

export default AffectionGauge;