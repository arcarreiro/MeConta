import React from 'react';
import { User, FeedbackRound } from '../../../types';
import { GraduationCap, User as UserIcon, CheckCircle2, Info, AlertCircle } from 'lucide-react';

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
    <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-soft relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apoio da Mentoria</h2>
            <p className="text-xs font-bold text-slate-400">
              {monitorsInGroup.length === 1
                ? 'Avaliação obrigatória para o seu mentor.'
                : 'Avalie ao menos um mentor para prosseguir.'}
            </p>
          </div>
        </div>
        {hasRequirementMet ? (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Requisito Cumprido
          </div>
        ) : (
          <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Info className="w-4 h-4" /> Pendente
          </div>
        )}
      </div>

      {!hasRequirementMet && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            Para que seu relatório seja gerado com sucesso, é obrigatório enviar feedback para pelo
            menos um mentor da sua turma.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monitorsInGroup.map((m) => {
          const isSubmitted = submittedMonitorIds.includes(m.id);
          return (
            <div
              key={m.id}
              className={`p-6 rounded-[2rem] flex flex-col gap-4 border transition-all ${
                isSubmitted
                  ? 'bg-emerald-50/30 border-emerald-100'
                  : 'bg-slate-50 border-transparent hover:border-violet-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <span className="font-black text-slate-900">{m.name}</span>
                </div>
                {isSubmitted && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> OK
                  </span>
                )}
              </div>
              {!isSubmitted ? (
                <>
                  <textarea
                    className="w-full rounded-2xl border-0 p-4 text-sm font-medium h-24 bg-white shadow-inner focus:ring-2 focus:ring-violet-200 transition-all"
                    placeholder={`Como foi o desempenho de ${m.name.split(' ')[0]}? Como ele ou ela pode te ajudar melhor na próxima sprint?`}
                    value={monitorFeedbackText[m.id] || ''}
                    onChange={(e) => onChangeText(m.id, e.target.value)}
                  />
                  <button
                    onClick={() => onSubmit(round.id, m.id)}
                    className="bg-slate-900 hover:bg-violet-600 text-white py-3 rounded-xl text-xs font-black transition-all shadow-soft active:scale-95"
                  >
                    Enviar Feedback
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
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

