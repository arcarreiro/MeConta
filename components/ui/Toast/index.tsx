
import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import './style.css';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <div
    className={`toast-notification ${type === 'success' ? 'toast--success' : 'toast--error'}`}
  >
    {type === 'success' ? (
      <CheckCircle2 className="toast-icon" />
    ) : (
      <AlertCircle className="toast-icon" />
    )}
    <span className="toast-message">{message}</span>
    <button
      onClick={onClose}
      className="toast-close-btn"
    >
      <X className="icon-tiny" />
    </button>
  </div>
);
