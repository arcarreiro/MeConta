
import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import './style.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-wrapper">
          <CheckCircle2 className="modal-icon" />
        </div>
        <div className="modal-text">
          <h3 className="modal-title">{title}</h3>
          {description && (
            <p className="modal-description">{description}</p>
          )}
        </div>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="modal-btn modal-btn--secondary"
          >
            Agora não
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="modal-btn modal-btn--primary"
          >
            {loading ? <Loader2 className="spinner-sm" /> : 'Sim, aprovar'}
          </button>
        </div>
      </div>
    </div>
  );
};
