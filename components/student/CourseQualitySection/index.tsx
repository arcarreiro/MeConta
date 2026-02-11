
import React from 'react';
import { CourseEvaluation } from '../../../types';
import { Star, CheckCircle2, AlertCircle, Lightbulb, Send } from 'lucide-react';
import './style.css';

interface CourseQualitySectionProps {
  roundId: string;
  evaluation: CourseEvaluation | undefined;
  submitted: boolean;
  onUpdateEval: (
    roundId: string,
    field: 'q1' | 'q2' | 'q3',
    subfield: 'score' | 'comment',
    value: any
  ) => void;
  onSubmit: (roundId: string) => void;
}

export const CourseQualitySection: React.FC<CourseQualitySectionProps> = ({
  roundId,
  evaluation,
  submitted,
  onUpdateEval,
  onSubmit,
}) => {
  if (submitted) {
    return (
      <section className="quality-section quality-section--submitted shadow-soft">
        <div className="submitted-msg animate-zoom">
          <CheckCircle2 className="icon-lg" />
          Experiência de conteúdo registrada.
        </div>
      </section>
    );
  }

  return (
    <section className="quality-section shadow-soft">
      <div className="section-header">
        <div className="header-icon-wrapper icon-bg-amber">
          <Star className="icon-md" />
        </div>
        <div className="header-text">
          <h2 className="section-title">Qualidade do Conteúdo</h2>
          <p className="section-subtitle">
            Diagnóstico da Experiência Pedagógica
          </p>
        </div>
      </div>

      <div className="section-form">
        {/* Q1: Clareza */}
        <div className="form-card card-emerald">
          <div className="card-header">
            <div className="card-label-wrapper">
              <CheckCircle2 className="icon-xs icon-text-emerald" />
              <label className="card-label label-emerald">
                1. Clareza e Relevância
              </label>
            </div>
            <span className="score-text text-emerald">
              {evaluation?.q1.score ?? 10}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="range-input range-emerald"
            value={evaluation?.q1.score ?? 10}
            onChange={(e) =>
              onUpdateEval(roundId, 'q1', 'score', parseInt(e.target.value, 10))
            }
          />
          <textarea
            className="form-textarea focus-emerald"
            placeholder="O conteúdo foi explicado de forma clara? O que você mais gostou?"
            value={evaluation?.q1.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q1', 'comment', e.target.value)}
          />
        </div>

        {/* Q2: Dificuldade */}
        <div className="form-card card-rose">
          <div className="card-header">
            <div className="card-label-wrapper">
              <AlertCircle className="icon-xs icon-text-rose" />
              <label className="card-label label-rose">
                2. Fator de Dificuldade
              </label>
            </div>
            <span className="score-text text-rose">
              {evaluation?.q2.score ?? 5}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="range-input range-rose"
            value={evaluation?.q2.score ?? 5}
            onChange={(e) =>
              onUpdateEval(roundId, 'q2', 'score', parseInt(e.target.value, 10))
            }
          />
          <textarea
            className="form-textarea focus-rose"
            placeholder="Algum tópico foi excessivamente difícil? Teve alguma barreira no aprendizado?"
            value={evaluation?.q2.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q2', 'comment', e.target.value)}
          />
        </div>

        {/* Q3: Sugestões */}
        <div className="form-card card-slate">
          <div className="card-label-wrapper">
            <Lightbulb className="icon-xs icon-text-slate" />
            <label className="card-label label-slate">
              3. Sugestões de Melhoria
            </label>
          </div>
          <textarea
            className="form-textarea form-textarea--tall focus-violet"
            placeholder="Como poderíamos tornar a próxima sprint ainda melhor para você?"
            value={evaluation?.q3.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q3', 'comment', e.target.value)}
          />
        </div>

        <button
          onClick={() => onSubmit(roundId)}
          className="submit-btn"
        >
          <Send className="icon-sm" /> Enviar Diagnóstico Completo
        </button>
      </div>
    </section>
  );
};
