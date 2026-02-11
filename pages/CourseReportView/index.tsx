
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { ArrowLeft, Printer, BarChart3, Star, Target, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { FeedbackRound, SynthesizedReport, CourseEvaluation } from '../../types';
import './style.css';

const CourseReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SynthesizedReport | null>(null);
  const [round, setRound] = useState<FeedbackRound | null>(null);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allReports = await Store.getReports();
        const allRounds = await Store.getRounds();
        const allEvals = await Store.getCourseEvaluations();
        
        const foundReport = allReports.find(r => r.id === id);
        if (foundReport) {
          setReport(foundReport);
          const actualRoundId = Array.isArray(foundReport.roundId) ? foundReport.roundId[0] : foundReport.roundId;
          const foundRound = allRounds.find(r => String(r.id) === String(actualRoundId));
          setRound(foundRound || null);
          if (foundRound) {
            setEvaluations(allEvals.filter(e => String(e.roundId) === String(foundRound.id)));
          }
        }
      } catch (err) {
        console.error("[CourseReportView] Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="course-report-loading">Carregando diagnóstico...</div>;
  if (!report || !round) return <div className="course-report-error">Relatório do curso não encontrado.</div>;

  const avgQ1 = evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + curr.q1.score, 0) / evaluations.length).toFixed(1) : "0";
  const avgQ2 = evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + curr.q2.score, 0) / evaluations.length).toFixed(1) : "0";

  return (
    <div className="course-report-page">
      <div className="course-report-actions no-print">
        <Link to="/admin" className="course-report-back-btn">
          <ArrowLeft size={20} /> Retornar ao Admin
        </Link>
        <button 
          onClick={() => window.print()}
          className="course-report-print-btn"
        >
          <Printer size={20} /> Imprimir Diagnóstico
        </button>
      </div>

      <div className="course-report-container">
        <Sparkles className="course-report-bg-sparkle" />
        
        <header className="course-report-header">
          <div className="course-report-header__brand">
            <div className="course-report-icon-wrapper">
               <BarChart3 size={48} />
            </div>
            <div>
              <h1 className="course-report-title">Saúde da <br /><span className="course-report-title--highlight">Aprendizagem</span></h1>
              <p className="course-report-subtitle">NPS Pedagógico Consolidado • MeConta AI</p>
            </div>
          </div>
          <div className="course-report-header__meta">
            <div className="course-report-meta-round">{round.name}</div>
            <div className="course-report-meta-date">Sessão de Diagnóstico: {new Date(report.createdAt).toLocaleDateString()}</div>
            <div className="course-report-meta-badge">{evaluations.length} Alunos Participantes</div>
          </div>
        </header>

        <div className="course-report-stats">
          <div className="course-report-stat-card course-report-stat-card--emerald">
             <Star className="course-report-stat-card__bg-icon" />
             <span className="course-report-stat-card__label">Clareza e Relevância</span>
             <div className="course-report-stat-card__value">{avgQ1}</div>
             <div className="course-report-stat-card__note">Média de satisfação com o conteúdo</div>
          </div>
          <div className="course-report-stat-card course-report-stat-card--rose">
             <AlertCircle className="course-report-stat-card__bg-icon" />
             <span className="course-report-stat-card__label">Fator de Dificuldade</span>
             <div className="course-report-stat-card__value">{avgQ2}</div>
             <div className="course-report-stat-card__note">Índice de fricção no aprendizado</div>
          </div>
        </div>

        <article className="course-report-article">
          <div className="course-report-article__divider">
             <div className="course-report-article__divider-line"></div>
             <div className="course-report-article__divider-text">Síntese Qualitativa da Turma</div>
             <div className="course-report-article__divider-line"></div>
          </div>
          
          <div className="course-report-article__content">
             {report.content}
          </div>
        </article>

        <section className="course-report-suggestions">
           <h2 className="course-report-suggestions__title">
              <MessageSquare className="course-report-suggestions__title-icon" /> Sugestões Diretas da Turma
           </h2>
           <div className="course-report-suggestions__grid">
              {evaluations.filter(e => !!e.q3.comment).slice(0, 10).map((ev, i) => (
                <div key={i} className="course-report-suggestion-card">
                  "{ev.q3.comment}"
                </div>
              ))}
           </div>
        </section>

        <footer className="course-report-footer">
          <BrandLogo size="md" />
          <p className="course-report-footer__label">Plataforma de Gestão de Aprendizagem MeConta</p>
        </footer>
      </div>
    </div>
  );
};

export default CourseReportView;
