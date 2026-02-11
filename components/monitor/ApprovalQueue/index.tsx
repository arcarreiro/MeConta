import React from 'react';
import { SynthesizedReport, FeedbackRound, User } from '../../../types';
import { Loader2, ShieldCheck, ClipboardCheck, User as UserIcon, ChevronDown, RefreshCw } from 'lucide-react';

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
    <>
      <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
        <ShieldCheck className="w-6 h-6 text-emerald-600" /> Fila de Aprovação
      </h2>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-soft overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Revise as sínteses geradas pela inteligência artificial antes de liberar para os alunos.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {reports.map((report) => {
            const student = users.find((u) => u.id === report.targetId);
            const roundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
            const round = rounds.find((rd) => rd.id === roundId);
            const isExpanded = expandedReportId === report.id;

            return (
              <div
                key={report.id}
                className="p-6 border-b border-slate-50 transition-all hover:bg-slate-50/50 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-inner">
                      {student?.photoUrl ? (
                        <img src={student.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="text-slate-300 w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{student?.name}</div>
                      <div className="text-[10px] font-black text-violet-500 uppercase tracking-[0.1em]">
                        {round?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleExpand(isExpanded ? null : report.id)}
                      className={`p-3 rounded-xl transition-all ${
                        isExpanded ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onApproveClick(report.id, roundId)}
                      className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 active:scale-95"
                    >
                      Aprovar
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap shadow-inner font-medium">
                      {report.content}
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        Sugestões de Ajuste (IA)
                      </label>
                      <textarea
                        placeholder="Ex: Tente ser mais motivador ou foque menos em detalhes técnicos..."
                        className="w-full rounded-2xl border-0 bg-slate-50 p-6 text-sm font-semibold focus:ring-2 focus:ring-violet-500 h-28 shadow-soft transition-all"
                        value={refinementText[report.id] || ''}
                        onChange={(e) => onChangeRefinement(report.id, e.target.value)}
                      />
                      <button
                        onClick={() => onRefine(report)}
                        disabled={refiningId === report.id}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-violet-600 transition-all flex items-center justify-center gap-3 shadow-soft active:scale-95 disabled:opacity-50"
                      >
                        {refiningId === report.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
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
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 text-center space-y-4 opacity-30 group">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                <ClipboardCheck className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-black text-slate-400 uppercase tracking-tighter">
                Tudo em dia por aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

