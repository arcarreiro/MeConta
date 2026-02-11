import React from 'react';
import { CourseEvaluation } from '../../../types';
import { Star, CheckCircle2, AlertCircle, Lightbulb, Send } from 'lucide-react';

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
      <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-soft">
        <div className="text-center p-12 bg-emerald-50 text-emerald-700 font-black rounded-[2rem] border border-emerald-100 flex flex-col items-center gap-3 animate-in zoom-in">
          <CheckCircle2 className="w-12 h-12" />
          Experiência de conteúdo registrada.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-soft">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
          <Star className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Qualidade do Conteúdo</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Diagnóstico da Experiência Pedagógica
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Q1: Clareza */}
        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] space-y-6 border border-emerald-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                1. Clareza e Relevância
              </label>
            </div>
            <span className="text-4xl font-black text-emerald-600">
              {evaluation?.q1.score ?? 10}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            value={evaluation?.q1.score ?? 10}
            onChange={(e) =>
              onUpdateEval(roundId, 'q1', 'score', parseInt(e.target.value, 10))
            }
          />
          <textarea
            className="w-full bg-white border-0 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-200 h-24 shadow-inner"
            placeholder="O conteúdo foi explicado de forma clara? O que você mais gostou?"
            value={evaluation?.q1.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q1', 'comment', e.target.value)}
          />
        </div>

        {/* Q2: Dificuldade */}
        <div className="bg-rose-50/50 p-8 rounded-[2.5rem] space-y-6 border border-rose-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <label className="text-xs font-black text-rose-700 uppercase tracking-widest">
                2. Fator de Dificuldade
              </label>
            </div>
            <span className="text-4xl font-black text-rose-600">
              {evaluation?.q2.score ?? 5}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            value={evaluation?.q2.score ?? 5}
            onChange={(e) =>
              onUpdateEval(roundId, 'q2', 'score', parseInt(e.target.value, 10))
            }
          />
          <textarea
            className="w-full bg-white border-0 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-rose-200 h-24 shadow-inner"
            placeholder="Algum tópico foi excessivamente difícil? Teve alguma barreira no aprendizado?"
            value={evaluation?.q2.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q2', 'comment', e.target.value)}
          />
        </div>

        {/* Q3: Sugestões */}
        <div className="bg-slate-50/80 p-8 rounded-[2.5rem] space-y-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-slate-500" />
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              3. Sugestões de Melhoria
            </label>
          </div>
          <textarea
            className="w-full bg-white border-0 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-violet-200 h-32 shadow-inner"
            placeholder="Como poderíamos tornar a próxima sprint ainda melhor para você?"
            value={evaluation?.q3.comment || ''}
            onChange={(e) => onUpdateEval(roundId, 'q3', 'comment', e.target.value)}
          />
        </div>

        <button
          onClick={() => onSubmit(roundId)}
          className="w-full bg-slate-900 hover:bg-violet-600 text-white py-5 rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <Send className="w-5 h-5" /> Enviar Diagnóstico Completo
        </button>
      </div>
    </section>
  );
};

