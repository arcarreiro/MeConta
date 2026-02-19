
import React from 'react';
import { User, FeedbackRound } from '../../../types';
import { GraduationCap, User as UserIcon, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import './style.css';

interface MentoringSectionProps {
  round: FeedbackRound;
  monitorsInGroup: User[];
  submittedMonitorIds: string[];
  monitorFeedbackText: Record<string, string>;
  onChangeText: (monitorId: string, value: string) => void;
  onSubmit: (roundId: string, monitorId: string) => void;
}

export const MentoringSection: React.FC<MentoringSectionProps> = ({
  round,
  monitorsInGroup,
  submittedMonitorIds,
  monitorFeedbackText,
  onChangeText,
  onSubmit,
}) => {
  const hasRequirementMet = submittedMonitorIds.length > 0;

  return (
    <section className="mentoring-section shadow-soft">
      <div className="section-header">
        <div className="header-info">
          <div className="header-icon-wrapper">
            <GraduationCap className="icon-md" />
          </div>
          <div className="header-text">
            <h2 className="section-title">Apoio da Mentoria</h2>
            <p className="section-desc">
              {monitorsInGroup.length === 1
                ? 'Avaliação obrigatória para o seu mentor.'
                : 'Avalie ao menos um mentor para prosseguir.'}
            </p>
          </div>
        </div>
        {hasRequirementMet ? (
          <div className="status-badge status-badge--success">
            <CheckCircle2 className="icon-xs" /> Requisito Cumprido
          </div>
        ) : (
          <div className="status-badge status-badge--pending">
            <Info className="icon-xs" /> Pendente
          </div>
        )}
      </div>

      {!hasRequirementMet && (
        <div className="requirement-alert">
          <AlertCircle className="alert-icon" />
          <span>
            Para que seu relatório seja gerado com sucesso, é obrigatório enviar feedback para pelo
            menos um mentor da sua turma.
          </span>
        </div>
      )}

      <div className="monitors-grid">
        {monitorsInGroup.map((m) => {
          const isSubmitted = submittedMonitorIds.includes(m.id);
          return (
            <div
              key={m.id}
              className={`mentor-card ${isSubmitted ? 'mentor-card--submitted' : ''}`}
            >
              <div className="card-top">
                <div className="mentor-info">
                  <div className="mentor-avatar">
                    <UserIcon className="icon-sm" />
                  </div>
                  <span className="mentor-name">{m.name}</span>
                </div>
                {isSubmitted && (
                  <span className="mini-badge">
                    <CheckCircle2 className="icon-tiny" /> OK
                  </span>
                )}
              </div>
              {!isSubmitted ? (
                <div className="card-form">
                  <textarea
                    className="mentor-textarea"
                    placeholder={`Como foi o desempenho de ${m.name.split(' ')[0]}? Como ele ou ela pode te ajudar melhor na próxima sprint?`}
                    value={monitorFeedbackText[m.id] || ''}
                    onChange={(e) => onChangeText(m.id, e.target.value)}
                  />
                  <button
                    onClick={() => onSubmit(round.id, m.id)}
                    className="mentor-submit-btn"
                  >
                    Enviar Feedback
                  </button>
                </div>
              ) : (
                <p className="submitted-msg">
                  Sua avaliação para este mentor foi registrada.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
