
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import './style.css';

interface DeleteGroupModalProps {
  isOpen: boolean;
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  isOpen,
  groupName,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-card">
        <div className="delete-modal-icon-wrapper">
          <AlertTriangle className="delete-modal-icon" />
        </div>
        <div className="delete-modal-text">
          <h3 className="delete-modal-title">
            Excluir Turma?
            <br />
            <span className="delete-modal-target">"{groupName}"</span>
          </h3>
          <p className="delete-modal-description">
            Esta ação removerá o registro da turma. Os alunos vinculados ficarão{' '}
            <strong>não alocados</strong>, mas seus relatórios e históricos individuais{' '}
            <strong>serão preservados</strong>.
          </p>
        </div>
        <div className="delete-modal-actions">
          <button
            onClick={onCancel}
            className="delete-modal-btn delete-modal-btn--cancel"
          >
            Manter Turma
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="delete-modal-btn delete-modal-btn--confirm"
          >
            {loading ? <Loader2 className="spinner-sm" /> : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};
