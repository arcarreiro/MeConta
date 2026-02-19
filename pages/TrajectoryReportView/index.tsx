
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { ArrowLeft, Printer, TrendingUp, Sparkles, Target, Compass, User as UserIcon, Loader2 } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { User, SynthesizedReport } from '../../types';
import './style.css';

const TrajectoryReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SynthesizedReport | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allReports = await Store.getReports();
      const allUsers = await Store.getUsers();
      
      const foundReport = allReports.find(r => r.id === id);
      if (foundReport) {
        setReport(foundReport);
        const foundStudent = allUsers.find(u => u.id === foundReport.targetId);
        setStudent(foundStudent || null);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="trajectory-loading">
      <Loader2 size={40} className="animate-spin" />
      <span>Consolidando trajetória...</span>
    </div>
  );

  if (!report) return <div className="trajectory-error">Trajetória não encontrada.</div>;

  return (
    <div className="trajectory-page">
      <div className="trajectory-actions no-print">
        <Link to="/" className="trajectory-back-btn">
          <ArrowLeft size={20} /> Painel Principal
        </Link>
        <button 
          onClick={() => window.print()}
          className="trajectory-print-btn"
        >
          <Printer size={20} /> Imprimir Jornada
        </button>
      </div>

      <div className="trajectory-container">
        <Sparkles className="trajectory-bg-sparkle" />
        
        <header className="trajectory-header">
          <div className="trajectory-header__brand">
            <div className="trajectory-icon-wrapper">
               <TrendingUp size={48} />
            </div>
            <div>
              <h1 className="trajectory-title">Jornada de <br /><span className="trajectory-title--highlight">Evolução</span></h1>
              <p className="trajectory-subtitle">Master Trajectory Analysis • MeConta AI</p>
            </div>
          </div>
          <div className="trajectory-header__meta">
            <div className="trajectory-meta-label">Protocolo de Consolidação</div>
            <div className="trajectory-meta-id">Sprint History #{report.id.substr(0,5)}</div>
            <div className="trajectory-meta-date">{new Date(report.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </header>

        <div className="trajectory-summary-grid">
          <div className="trajectory-summary-card">
            <UserIcon className="trajectory-summary-card__bg-icon" />
            <span className="trajectory-summary-card__label">Talento em Foco</span>
            <div className="trajectory-summary-card__value">{student?.name}</div>
            <div className="trajectory-summary-card__subvalue">{student?.email}</div>
          </div>
          
          <div className="trajectory-summary-card">
            <Target className="trajectory-summary-card__bg-icon" />
            <span className="trajectory-summary-card__label">Base de Dados</span>
            <div className="trajectory-summary-card__value">{Array.isArray(report.roundId) ? report.roundId.length : 1} Sprints</div>
            <div className="trajectory-summary-card__subvalue">Histórico Consolidado</div>
          </div>

          <div className="trajectory-summary-card trajectory-summary-card--dark">
            <Compass className="trajectory-summary-card__bg-icon" />
            <span className="trajectory-summary-card__label">Visão Estratégica</span>
            <div className="trajectory-summary-card__value">Trajetória de Carreira</div>
          </div>
        </div>

        <article className="trajectory-article">
          <div className="trajectory-article__divider">
             <div className="trajectory-article__divider-line"></div>
             <div className="trajectory-article__divider-text">A Narrativa de Crescimento</div>
             <div className="trajectory-article__divider-line"></div>
          </div>
          
          <div className="trajectory-article__body">
             <div className="trajectory-article__content">
                {report.content}
             </div>
          </div>
        </article>

        <footer className="trajectory-footer">
          <BrandLogo size="md" />
          <div className="trajectory-footer__text">
             <p className="trajectory-footer__label">Relatório de Inteligência MeConta</p>
             <p className="trajectory-footer__note">Este documento foi sintetizado por inteligência artificial a partir de evidências comportamentais e avaliações anônimas de pares e mentoria.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TrajectoryReportView;
