import React from 'react';
import { UI_THEMES } from '../data/constants';

interface StatusGaugeProps {
  label: string;
  current: number;
  max: number;
  ui_key: string;
}

const StatusGauge: React.FC<StatusGaugeProps> = ({ label, current, max, ui_key }) => {
  const theme = (UI_THEMES as any)[ui_key] || UI_THEMES.pink_heart;
  const percentage = Math.min(Math.max((current / max) * 100, 0), 100);

  // Special UI logic from requirements
  const isFatigueHigh = ui_key === 'yellow_bolt' && percentage >= 80;
  const isHungry = ui_key === 'orange_apple' && percentage <= 20;
  const isMoody = ui_key === 'green_smile' && percentage <= 30;

  const displayIcon = isHungry ? '🦴' : (isMoody ? '💢' : theme.icon);

  return (
    <div className="flex flex-col gap-0.5 w-40 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isFatigueHigh ? 'animate-pulse' : ''}`}>{displayIcon}</span>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">{label}</span>
        </div>
        <span className="text-[9px] text-white/60">{current}/{max}</span>
      </div>
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${isFatigueHigh ? 'animate-pulse' : ''}`}
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: theme.color,
            boxShadow: `0 0 10px ${theme.color}44`
          }}
        />
        <div className="absolute top-0 left-0 h-1/2 w-full bg-white/10" />
      </div>
    </div>
  );
};

export default StatusGauge;