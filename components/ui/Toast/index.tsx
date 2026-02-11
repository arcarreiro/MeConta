import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[100] p-5 rounded-[1.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-300 ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="w-6 h-6 shrink-0" />
    ) : (
      <AlertCircle className="w-6 h-6 shrink-0" />
    )}
    <span className="text-sm font-bold tracking-tight">{message}</span>
    <button
      onClick={onClose}
      className="ml-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

