
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../services/store';
import { User, SynthesizedReport, FeedbackRound } from '../types';
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-300">Aluno não encontrado.</h2>
        <Link to="/admin" className="mt-4 inline-block text-violet-600 font-bold underline">Voltar ao Painel</Link>
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-violet-600 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Ficha do Talento</h1>
          <p className="text-slate-500 font-medium">Informações detalhadas e evolução do aluno.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Coluna de Perfil */}
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
             <div className="relative mb-6">
                {student.photoUrl ? (
                  <img src={student.photoUrl} className="w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-violet-50" />
                ) : (
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}
             </div>
             <h2 className="text-2xl font-black text-slate-900 leading-tight">{student.name}</h2>
             <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-sm">
               <Mail className="w-4 h-4" /> {student.email}
             </div>
             <div className="mt-6 px-4 py-1.5 bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest rounded-full">
               Aluno Registrado
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
             <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <FileText className="w-4 h-4" /> Currículo Profissional
             </h3>
             {student.resumeUrl ? (
               <button 
                 onClick={handleDownloadResume}
                 className="w-full bg-violet-600 text-white p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/20"
               >
                 <Download className="w-5 h-5" /> Baixar Currículo PDF
               </button>
             ) : (
               <div className="p-6 border-2 border-dashed border-slate-700 rounded-3xl text-center text-slate-500 text-xs font-bold italic">
                 Nenhum currículo enviado pelo aluno.
               </div>
             )}
          </div>
        </div>

        {/* Coluna de Conteúdo */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                   <UserIcon className="w-3 h-3" /> Biografia / Sobre
                </label>
                <div className="text-slate-700 leading-relaxed font-medium">
                   {student.bio || <span className="italic text-slate-300">Biografia não preenchida.</span>}
                </div>
             </div>
             <div className="space-y-2 pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                   <GraduationCap className="w-3 h-3" /> Informações Curriculares
                </label>
                <div className="text-slate-700 leading-relaxed font-medium">
                   {student.curricularInfo || <span className="italic text-slate-300">Dados curriculares não preenchidos.</span>}
                </div>
             </div>
          </section>

          <section className="space-y-6">
             <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 ml-2">
               <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                 <History className="w-5 h-5 text-amber-600" />
               </div>
               Histórico de Relatórios
             </h3>
             <div className="grid gap-4">
                {reports.map(report => {
                  const reportRoundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
                  const round = rounds.find(r => r.id === reportRoundId);
                  const isTrajectory = report.type === 'TRAJECTORY';

                  return (
                    <Link 
                      key={report.id} 
                      to={isTrajectory ? `/trajectory-report/${report.id}` : `/report/${report.id}`}
                      className={`p-6 bg-white border rounded-[2rem] flex items-center justify-between group transition-all hover:shadow-xl ${isTrajectory ? 'border-violet-100' : 'border-slate-100'}`}
                    >
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isTrajectory ? 'bg-violet-600 shadow-violet-100' : 'bg-slate-900 shadow-slate-100'}`}>
                            {isTrajectory ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                         </div>
                         <div>
                            <div className="font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                               {isTrajectory ? 'Consolidado de Trajetória' : (round?.name || 'Relatório Individual')}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                               <Calendar className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                         </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
                {reports.length === 0 && (
                  <div className="py-16 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                     <p className="text-slate-300 font-bold italic">Nenhum relatório foi gerado para este aluno ainda.</p>
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
