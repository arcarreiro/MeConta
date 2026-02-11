import React from 'react';
import { SynthesizedReport, FeedbackRound } from '../../../types';
import { Link } from 'react-router-dom';
import { History, CalendarDays, ArrowRight } from 'lucide-react';

interface ReportsTimelineProps {
  reports: SynthesizedReport[];
  rounds: FeedbackRound[];
}

export const ReportsTimeline: React.FC<ReportsTimelineProps> = ({ reports, rounds }) => {
  return (
    <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-1 space-y-8">
      <div className="flex items-center gap-3 px-2">
        <History className="w-6 h-6 text-violet-600" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Meus Relatórios</h2>
      </div>

      <div className="relative ml-4 space-y-8 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
        {reports.map((report, index) => {
          const reportRoundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
          const round = rounds.find((r) => r.id === reportRoundId);
          return (
            <div key={report.id} className="relative flex items-start group">
              <div
                className={`absolute left-0 mt-1.5 w-4 h-4 rounded-full border-4 border-white shadow-soft ring-2 transition-all group-hover:scale-125 ${
                  index === 0 ? 'bg-violet-600 ring-violet-100' : 'bg-slate-300 ring-slate-50'
                }`}
              ></div>
              <div className="ml-10 w-full transform transition-transform group-hover:translate-x-1">
                <Link
                  to={`/report/${report.id}`}
                  className="block p-5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-xl hover:border-violet-200 transition-all"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">
                    {round?.name || 'Sprint Concluída'}
                  </h3>
                  <div className="mt-3 flex items-center text-[10px] font-black text-violet-600 gap-1 uppercase tracking-wider">
                    Ver Detalhes <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="ml-10 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-xs text-slate-400 font-bold italic leading-relaxed">
            Aqui aparecerão seus relatórios individuais após cada Sprint.
          </div>
        )}
      </div>
    </aside>
  );
};

