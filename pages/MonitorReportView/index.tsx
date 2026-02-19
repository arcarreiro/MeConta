
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { ArrowLeft, Printer, GraduationCap, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { User, SynthesizedReport } from '../../types';
import './style.css';

const MonitorReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SynthesizedReport | null>(null);
  const [monitor, setMonitor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allReports = await Store.getReports();
      const allUsers = await Store.getUsers();
      
      const foundReport = allReports.find(r => r.id === id);
      if (foundReport) {
        setReport(foundReport);
        const foundMonitor = allUsers.find(u => u.id === foundReport.targetId);
        setMonitor(foundMonitor || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="monitor-report-loading">Carregando relatório...</div>;
  if (!report) return <div className="monitor-report-error">Relatório não encontrado.</div>;

  return (
    <div className="monitor-report-page">
      <div className="monitor-report-actions no-print">
        <Link to="/monitor" className="monitor-report-back-btn">
          <ArrowLeft size={20} /> Painel de Mentoria
        </Link>
        <button 
          onClick={() => window.print()}
          className="monitor-report-print-btn"
        >
          <Printer size={16} /> Baixar PDF de Impacto
        </button>
      </div>

      <div className="monitor-report-container">
        <div className="monitor-report-header">
          <div className="monitor-report-header__brand">
            <div className="monitor-report-icon-wrapper">
               <GraduationCap size={40} />
            </div>
            <div>
              <h1 className="monitor-report-title">Impacto da <span className="monitor-report-title--highlight">Mentoria</span></h1>
              <p className="monitor-report-subtitle">Análise Pedagógica MeConta</p>
            </div>
          </div>
          <div className="monitor-report-meta">
            <div className="monitor-report-badge">Monitoria Consolidada</div>
            <div className="monitor-report-date">{new Date(report.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="monitor-report-target-card">
            <span className="monitor-report-target-label">Mentor(a) Analisado(a)</span>
            <div className="monitor-report-target-name">{monitor?.name}</div>
        </div>

        <section className="monitor-report-section">
          <Sparkles className="monitor-report-sparkle" />
          <h2 className="monitor-report-section-title">
            <div className="monitor-report-title-bar"></div>
            Percepção dos Alunos e Impacto
          </h2>
          <div className="monitor-report-content">
            {report.content}
          </div>
        </section>

        <footer className="monitor-report-footer">
          <BrandLogo size="sm" />
          <div className="monitor-report-footer-text">
             <p className="monitor-report-footer-disclaimer">Tecnologia MeConta - Apoio à Excelência Docente</p>
             <p className="monitor-report-footer-note">Relatório gerado a partir de feedbacks anônimos coletados durante a rodada de orientação.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MonitorReportView;
