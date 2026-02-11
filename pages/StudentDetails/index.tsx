
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../../services/store';
import { User, SynthesizedReport, FeedbackRound } from '../../types';
import { 
  ArrowLeft, 
  User as UserIcon, 
  FileText, 
  GraduationCap, 
  Download, 
  History, 
  ChevronRight, 
  ShieldCheck, 
  Calendar,
  Loader2,
  Mail
} from 'lucide-react';
import './style.css';

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<User | null>(null);
  const [reports, setReports] = useState<SynthesizedReport[]>([]);
  const [rounds, setRounds] = useState<FeedbackRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allUsers = await Store.getUsers();
        const allReports = await Store.getReports();
        const allRounds = await Store.getRounds();
        
        const found = allUsers.find(u => u.id === id);
        if (found) {
          setStudent(found);
          setReports(allReports.filter(r => r.targetId === id).sort((a,b) => b.createdAt - a.createdAt));
          setRounds(allRounds);
        }
      } catch (err) {
        console.error("[StudentDetails] Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="student-details-loading">
        <Loader2 className="student-details-loading__icon" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-details-empty">
        <h2 className="student-details-empty__title">Aluno não encontrado.</h2>
        <Link to="/admin" className="student-details-empty__link">Voltar ao Painel</Link>
      </div>
    );
  }

  const handleDownloadResume = () => {
    if (student.resumeUrl) {
      const link = document.createElement('a');
      link.href = student.resumeUrl;
      link.download = `curriculo-${student.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      link.click();
    }
  };

  return (
    <div className="student-details-page">
      <div className="student-details-header">
        <Link to="/admin" className="student-details-back-btn">
          <ArrowLeft size={20} />
        </Link>
        <div className="student-details-header__text">
          <h1 className="student-details-header__title">Ficha do Talento</h1>
          <p className="student-details-header__subtitle">Informações detalhadas e evolução do aluno.</p>
        </div>
      </div>

      <div className="student-details-grid">
        <div className="student-details-sidebar">
          <div className="student-details-profile-card">
             <div className="student-details-avatar-wrapper">
                {student.photoUrl ? (
                  <img src={student.photoUrl} className="student-details-avatar" />
                ) : (
                  <div className="student-details-avatar-placeholder">
                    <UserIcon size={48} />
                  </div>
                )}
             </div>
             <h2 className="student-details-profile-name">{student.name}</h2>
             <div className="student-details-profile-email">
               <Mail size={16} /> {student.email}
             </div>
             <div className="student-details-profile-badge">
               Aluno Registrado
             </div>
          </div>

          <div className="student-details-resume-card">
             <h3 className="student-details-resume-title">
               <FileText size={16} /> Currículo Profissional
             </h3>
             {student.resumeUrl ? (
               <button 
                 onClick={handleDownloadResume}
                 className="student-details-resume-btn"
               >
                 <Download size={20} /> Baixar Currículo PDF
               </button>
             ) : (
               <div className="student-details-resume-empty">
                 Nenhum currículo enviado pelo aluno.
               </div>
             )}
          </div>
        </div>

        <div className="student-details-main">
          <section className="student-details-info-section">
             <div className="student-details-info-field">
                <label className="student-details-info-label">
                   <UserIcon size={12} /> Biografia / Sobre
                </label>
                <div className="student-details-info-text">
                   {student.bio || <span className="italic text-slate-300">Biografia não preenchida.</span>}
                </div>
             </div>
             <div className="student-details-info-field student-details-info-field--border">
                <label className="student-details-info-label">
                   <GraduationCap size={12} /> Informações Curriculares
                </label>
                <div className="student-details-info-text">
                   {student.curricularInfo || <span className="italic text-slate-300">Dados curriculares não preenchidos.</span>}
                </div>
             </div>
          </section>

          <section className="student-details-history">
             <h3 className="student-details-history__title">
               <div className="student-details-history__icon-wrapper">
                 <History size={20} />
               </div>
               Histórico de Relatórios
             </h3>
             <div className="student-details-reports-list">
                {reports.map(report => {
                  const reportRoundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
                  const round = rounds.find(r => r.id === reportRoundId);
                  const isTrajectory = report.type === 'TRAJECTORY';

                  return (
                    <Link 
                      key={report.id} 
                      to={isTrajectory ? `/trajectory-report/${report.id}` : `/report/${report.id}`}
                      className={`student-details-report-item group ${isTrajectory ? 'student-details-report-item--trajectory' : ''}`}
                    >
                      <div className="student-details-report-item__content">
                         <div className={`student-details-report-icon ${isTrajectory ? 'student-details-report-icon--trajectory' : 'student-details-report-icon--default'}`}>
                            {isTrajectory ? <ShieldCheck size={24} /> : <FileText size={24} />}
                         </div>
                         <div>
                            <div className="student-details-report-name">
                               {isTrajectory ? 'Consolidado de Trajetória' : (round?.name || 'Relatório Individual')}
                            </div>
                            <div className="student-details-report-date">
                               <Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                         </div>
                      </div>
                      <ChevronRight className="student-details-report-arrow" />
                    </Link>
                  );
                })}
                {reports.length === 0 && (
                  <div className="student-details-reports-empty">
                     <p className="student-details-reports-empty__text">Nenhum relatório foi gerado para este aluno ainda.</p>
                  </div>
                )}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
