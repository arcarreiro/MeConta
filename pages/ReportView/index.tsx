
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { Mail, ArrowLeft, Printer, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { User, SynthesizedReport, Group } from '../../types';
import './style.css';

const ReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SynthesizedReport | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allReports = await Store.getReports();
      const allUsers = await Store.getUsers();
      const allGroups = await Store.getGroups();
      
      const foundReport = allReports.find(r => r.id === id);
      if (foundReport) {
        setReport(foundReport);
        const foundUser = allUsers.find(u => u.id === foundReport.targetId);
        setUser(foundUser || null);
      }
      setGroups(allGroups);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="report-loading">Carregando relatório...</div>;
  if (!report) return <div className="report-error">Relatório extraviado. Contate o suporte.</div>;

  return (
    <div className="report-page">
      <div className="report-actions no-print">
        <Link to="/" className="report-back-btn">
          <ArrowLeft size={20} /> Voltar ao Painel
        </Link>
        <div className="report-action-group">
          <button 
            onClick={() => alert(`Enviando cópia digital para ${user?.email}...`)}
            className="report-btn report-btn--white"
          >
            <Mail size={16} /> Enviar Cópia
          </button>
          <button 
            onClick={() => window.print()}
            className="report-btn report-btn--primary"
          >
            <Printer size={16} /> Baixar PDF
          </button>
        </div>
      </div>

      <div className="report-container">
        <div className="report-header">
          <div className="report-header__brand">
            <BrandLogo size="lg" />
            <div>
              <h1 className="report-header__title">Relatório <span className="report-header__title--highlight">Individual</span></h1>
              <p className="report-header__subtitle">Sessão de Desenvolvimento MeConta</p>
            </div>
          </div>
          <div className="report-header__meta">
            <div className="report-header__badge">Documento Verificado</div>
            <div className="report-header__id">Protocolo: #{report.id.substr(0,8)}</div>
            <div className="report-header__date">{new Date(report.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div className="report-info-grid">
          <div className="report-info-card">
            <span className="report-info-card__label">Membro Avaliado</span>
            <div className="report-info-card__value">{user?.name}</div>
            <div className="report-info-card__subvalue">{user?.email}</div>
          </div>
          <div className="report-info-card">
            <span className="report-info-card__label">Contexto de Feedback</span>
            <div className="report-info-card__value">Cultura 360°</div>
            <div className="report-info-card__subvalue">Turma: {groups.find(g => g.id === user?.groupId)?.name}</div>
          </div>
        </div>

        <section className="report-section">
          <h2 className="report-section__title">
            <div className="report-section__title-bar"></div>
            Síntese de Performance
          </h2>
          <div className="report-content">
            {report.content}
          </div>
        </section>

        <section className="report-evolution-card">
          <Sparkles className="report-evolution-card__sparkle" />
          <h2 className="report-evolution-card__title">
            Insights de Evolução
          </h2>
          <div className="report-evolution-content">
            {report.evolution}
          </div>
        </section>

        <footer className="report-footer">
          <BrandLogo size="sm" />
          <div className="report-footer__text">
             <p className="report-footer__disclaimer">Propriedade da Plataforma MeConta AI</p>
             <p className="report-footer__note">Este documento é confidencial e destinado exclusivamente ao desenvolvimento pessoal do aluno.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportView;
