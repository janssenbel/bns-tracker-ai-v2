import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-500/95 text-white border-emerald-400 shadow-emerald-500/20'
            : 'bg-blue-600/95 text-white border-blue-400 shadow-blue-600/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
        ) : (
          <Info className="w-4 h-4 shrink-0 text-white" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
