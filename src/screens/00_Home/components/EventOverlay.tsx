import React from 'react';
import type { EventScenario } from '../types';
import { ChevronRight } from 'lucide-react';

interface EventOverlayProps {
  scenario: EventScenario;
  currentStepIndex: number;
  onNext: () => void;
}

const EventOverlay: React.FC<EventOverlayProps> = ({ scenario, currentStepIndex, onNext }) => {
  const step = scenario.steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end pb-12 pointer-events-none">
      {/* Background Dim */}
      <div
        className={`absolute inset-0 bg-black/80 transition-opacity duration-1000 ease-in-out ${step.action === 'bg_dim' || step.action === 'zoom_in' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Flash Effect */}
      {step.action === 'flash_white' && (
        <div className="absolute inset-0 bg-white z-[110] animate-pulse pointer-events-none" />
      )}

      {/* Screen Shake - Managed via CSS class on main container usually, but here we can add a subtle shake to the text box */}

      {/* Event UI */}
      <div className="relative z-[120] w-full max-w-2xl px-6 pointer-events-auto cursor-pointer" onClick={onNext}>
        <div className="bg-slate-900/90 border-2 border-pink-500/50 p-8 rounded-3xl shadow-[0_0_30px_rgba(236,72,153,0.3)] backdrop-blur-xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-pink-600 text-white text-xs font-black px-3 py-1 rounded tracking-tighter uppercase">
              Event: {scenario.title}
            </div>
            <div className="text-white/40 text-[10px] tracking-widest">
              STEP {step.step} / {scenario.steps.length}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-pink-400 font-bold text-sm">【 {step.speaker} 】</span>
            <p className="text-white text-lg font-medium leading-relaxed min-h-[4rem]">
              {step.text}
            </p>
          </div>

          <div className="flex justify-end mt-4 items-center gap-2 text-pink-300 animate-pulse">
            <span className="text-[10px] font-bold">NEXT</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Heart Particles Animation Logic could be added here */}
        {step.action === 'particle_heart' && (
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 text-7xl animate-bounce">
            💖
          </div>
        )}
      </div>
    </div>
  );
};

export default EventOverlay;