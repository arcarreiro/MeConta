import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-200 text-center border border-slate-100">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Excluir Turma?
            <br />
            <span className="text-rose-600 text-lg">"{groupName}"</span>
          </h3>
          <p className="text-slate-500 font-medium mt-4 leading-relaxed">
            Esta ação removerá o registro da turma. Os alunos vinculados ficarão{' '}
            <strong>não alocados</strong>, mas seus relatórios e históricos individuais{' '}
            <strong>serão preservados</strong>.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            Manter Turma
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

