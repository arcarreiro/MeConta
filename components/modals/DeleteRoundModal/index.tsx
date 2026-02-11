
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import './style.css';

interface DeleteRoundModalProps {
  isOpen: boolean;
  roundName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteRoundModal: React.FC<DeleteRoundModalProps> = ({
  isOpen,
  roundName,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="round-modal-overlay">
      <div className="round-modal-card">
        <div className="round-modal-icon-wrapper">
          <AlertTriangle className="round-modal-icon" />
        </div>
        <div className="round-modal-text">
          <h3 className="round-modal-title">
            Excluir Sprint?
            <br />
            <span className="round-modal-target">"{roundName}"</span>
          </h3>
          <p className="round-modal-description">
            Esta ação é irreversível. Todos os feedbacks enviados e relatórios IA gerados nesta
            rodada serão perdidos.
          </p>
        </div>
        <div className="round-modal-actions">
          <button
            onClick={onCancel}
            className="round-modal-btn round-modal-btn--cancel"
          >
            Manter Sprint
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="round-modal-btn round-modal-btn--confirm"
          >
            {loading ? <Loader2 className="spinner-sm" /> : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};
