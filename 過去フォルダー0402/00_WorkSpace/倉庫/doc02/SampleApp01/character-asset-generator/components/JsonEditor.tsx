
import React from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-80 bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>Order List (JSON)</span>
        <span className="text-yellow-400">Validated</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full p-4 bg-transparent resize-none font-mono text-sm text-yellow-100/80 outline-none scrollbar-thin scrollbar-thumb-slate-700"
      />
    </div>
  );
};
