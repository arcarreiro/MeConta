
import React from 'react';
import { SynthesizedReport, FeedbackRound, User } from '../../../types';
import { Loader2, ShieldCheck, ClipboardCheck, User as UserIcon, ChevronDown, RefreshCw } from 'lucide-react';
import './style.css';

interface ApprovalQueueProps {
  reports: SynthesizedReport[];
  users: User[];
  rounds: FeedbackRound[];
  refinementText: Record<string, string>;
  refiningId: string | null;
  expandedReportId: string | null;
  onToggleExpand: (id: string | null) => void;
  onChangeRefinement: (id: string, value: string) => void;
  onRefine: (report: SynthesizedReport) => void;
  onApproveClick: (reportId: string, roundId: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  reports,
  users,
  rounds,
  refinementText,
  refiningId,
  expandedReportId,
  onToggleExpand,
  onChangeRefinement,
  onRefine,
  onApproveClick,
}) => {
  return (
    <div className="approval-queue">
      <h2 className="approval-queue-title">
        <ShieldCheck className="title-icon icon-emerald" /> Fila de Aprovação
      </h2>
      <div className="approval-container">
        <div className="approval-header">
          <p className="approval-subtitle">
            Revise as sínteses geradas pela inteligência artificial antes de liberar para os alunos.
          </p>
        </div>
        <div className="approval-list">
          {reports.map((report) => {
            const student = users.find((u) => u.id === report.targetId);
            const roundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
            const round = rounds.find((rd) => rd.id === roundId);
            const isExpanded = expandedReportId === report.id;

            return (
              <div
                key={report.id}
                className="approval-item"
              >
                <div className="item-header">
                  <div className="item-info">
                    <div className="avatar-wrapper">
                      {student?.photoUrl ? (
                        <img src={student.photoUrl} className="avatar-img" />
                      ) : (
                        <UserIcon className="avatar-placeholder" />
                      )}
                    </div>
                    <div className="item-details">
                      <div className="student-name">{student?.name}</div>
                      <div className="round-name">
                        {round?.name}
                      </div>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => onToggleExpand(isExpanded ? null : report.id)}
                      className={`expand-btn ${isExpanded ? 'expand-btn--active' : ''}`}
                    >
                      <ChevronDown
                        className={`chevron-icon ${isExpanded ? 'chevron-icon--rotated' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => onApproveClick(report.id, roundId)}
                      className="approve-btn"
                    >
                      Aprovar
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="expanded-content">
                    <div className="report-content-card">
                      {report.content}
                    </div>
                    <div className="refinement-section">
                      <label className="refinement-label">
                        Sugestões de Ajuste (IA)
                      </label>
                      <textarea
                        placeholder="Ex: Tente ser mais motivador ou foque menos em detalhes técnicos..."
                        className="refinement-textarea"
                        value={refinementText[report.id] || ''}
                        onChange={(e) => onChangeRefinement(report.id, e.target.value)}
                      />
                      <button
                        onClick={() => onRefine(report)}
                        disabled={refiningId === report.id}
                        className="refine-submit-btn"
                      >
                        {refiningId === report.id ? (
                          <Loader2 className="spinner-xs" />
                        ) : (
                          <RefreshCw className="icon-xs" />
                        )}{' '}
                        Refinar Síntese
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {reports.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <ClipboardCheck className="empty-icon" />
              </div>
              <p className="empty-text">
                Tudo em dia por aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
