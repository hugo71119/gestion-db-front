import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in">
      <div className="flex items-center gap-3 bg-white border border-emerald-200 shadow-xl rounded-xl px-4 py-3.5 min-w-[280px]">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-slate-800 flex-1">{message}</p>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 border-none bg-transparent cursor-pointer p-0.5">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
