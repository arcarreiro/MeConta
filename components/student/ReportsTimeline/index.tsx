
import React from 'react';
import { SynthesizedReport, FeedbackRound } from '../../../types';
import { Link } from 'react-router-dom';
import { History, CalendarDays, ArrowRight } from 'lucide-react';
import './style.css';

interface ReportsTimelineProps {
  reports: SynthesizedReport[];
  rounds: FeedbackRound[];
}

export const ReportsTimeline: React.FC<ReportsTimelineProps> = ({ reports, rounds }) => {
  return (
    <aside className="reports-aside">
      <div className="aside-header">
        <History className="icon-header icon-violet" />
        <h2 className="aside-title">Meus Relatórios</h2>
      </div>

      <div className="timeline">
        <div className="timeline-line"></div>
        {reports.map((report, index) => {
          const reportRoundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
          const round = rounds.find((r) => r.id === reportRoundId);
          const isLatest = index === 0;
          return (
            <div key={report.id} className="timeline-item group">
              <div
                className={`timeline-dot ${isLatest ? 'dot-latest' : 'dot-old'}`}
              ></div>
              <div className="timeline-content">
                <Link
                  to={`/report/${report.id}`}
                  className="timeline-card shadow-soft"
                >
                  <div className="card-date">
                    <CalendarDays className="icon-tiny" />
                    {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <h3 className="card-title">
                    {round?.name || 'Sprint Concluída'}
                  </h3>
                  <div className="card-footer">
                    Ver Detalhes <ArrowRight className="icon-tiny footer-arrow" />
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="timeline-empty">
            Aqui aparecerão seus relatórios individuais após cada Sprint.
          </div>
        )}
      </div>
    </aside>
  );
};
