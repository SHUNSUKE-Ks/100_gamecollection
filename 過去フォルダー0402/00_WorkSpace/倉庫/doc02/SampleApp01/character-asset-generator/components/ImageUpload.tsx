
import React, { useState, useCallback } from 'react';

interface ImageUploadProps {
  image: string | null;
  onUpload: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ image, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  return (
    <div 
      className="relative group"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={`w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden flex flex-col items-center justify-center bg-slate-900/30 ${
        image 
          ? 'border-slate-800' 
          : isDragging 
            ? 'border-yellow-400 bg-yellow-400/5 scale-[1.02]' 
            : 'border-slate-700 hover:border-slate-500'
      }`}>
        {image ? (
          <>
            <img src={image} alt="Reference" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <label className="p-3 bg-slate-900 rounded-full cursor-pointer hover:bg-yellow-400 hover:text-slate-950 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
               </label>
               <button 
                  onClick={() => onUpload('')}
                  className="p-3 bg-slate-900 rounded-full hover:bg-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
            </div>
          </>
        ) : (
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isDragging ? 'bg-yellow-400 text-slate-950 scale-110' : 'bg-slate-800 text-slate-400'
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className={`font-bold transition-colors ${isDragging ? 'text-yellow-400' : 'text-slate-300'}`}>
                {isDragging ? 'Drop Image Here' : 'Upload Reference Image'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Drag and drop or click to browse</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};
