
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../services/store';
// Added Loader2 to the imports
import { ArrowLeft, Printer, TrendingUp, Sparkles, Target, Compass, User as UserIcon, Loader2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { User, SynthesizedReport } from '../types';

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

  // Fix: Loader2 was missing from imports
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold"><Loader2 className="w-10 h-10 animate-spin mr-3" /> Consolidando trajetória...</div>;
  if (!report) return <div className="p-10 text-center font-bold text-slate-400">Trajetória não encontrada.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-1000 pb-24">
      <div className="flex items-center justify-between no-print px-4">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-violet-600 font-bold transition-all transform hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> Painel Principal
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-[1.5rem] hover:shadow-2xl hover:shadow-violet-200 transition-all font-black flex items-center gap-3 shadow-brand active:scale-95"
        >
          <Printer className="w-5 h-5" /> Imprimir Jornada
        </button>
      </div>

      <div className="bg-white border-[12px] border-violet-50/50 rounded-[4rem] shadow-soft overflow-hidden p-16 md:p-24 space-y-20 relative print:border-none print:shadow-none print:p-0">
        <Sparkles className="absolute top-20 right-20 text-violet-100 w-40 h-40 opacity-20 pointer-events-none" />
        
        <header className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-slate-50 pb-16 gap-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-violet-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-violet-200">
               <TrendingUp className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Jornada de <br /><span className="text-violet-600">Evolução</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Master Trajectory Analysis • MeConta AI</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-sm font-black text-slate-300 uppercase tracking-widest mb-2">Protocolo de Consolidação</div>
            <div className="text-3xl font-black text-slate-900">Sprint History #{report.id.substr(0,5)}</div>
            <div className="text-sm text-violet-500 font-bold mt-2">{new Date(report.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50/80 p-10 rounded-[3rem] border border-slate-100 relative group overflow-hidden shadow-inner">
            <UserIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-100 group-hover:text-violet-100 transition-colors" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Talento em Foco</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{student?.name}</div>
            <div className="text-slate-500 font-bold mt-2 text-sm">{student?.email}</div>
          </div>
          
          <div className="bg-slate-50/80 p-10 rounded-[3rem] border border-slate-100 relative group overflow-hidden shadow-inner">
            <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-100 group-hover:text-violet-100 transition-colors" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Base de Dados</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{Array.isArray(report.roundId) ? report.roundId.length : 1} Sprints</div>
            <div className="text-slate-500 font-bold mt-2 text-sm">Histórico Consolidado</div>
          </div>

          <div className="bg-violet-600 p-10 rounded-[3rem] text-white shadow-brand relative group overflow-hidden">
            <Compass className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 transition-transform group-hover:rotate-12" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-4">Visão Estratégica</span>
            <div className="text-3xl font-black tracking-tight">Trajetória de Carreira</div>
          </div>
        </div>

        <article className="space-y-12">
          <div className="flex items-center gap-6">
             <div className="h-[1px] flex-1 bg-slate-100"></div>
             <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] whitespace-nowrap">A Narrativa de Crescimento</div>
             <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          
          <div className="prose prose-slate max-w-none px-4 md:px-10">
             <div className="text-slate-700 text-2xl leading-[1.7] whitespace-pre-wrap font-medium first-letter:text-7xl first-letter:font-black first-letter:text-violet-600 first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                {report.content}
             </div>
          </div>
        </article>

        <footer className="pt-20 border-t border-slate-100 mt-20 flex flex-col items-center text-center space-y-6">
          <BrandLogo size="md" />
          <div className="max-w-lg">
             <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Relatório de Inteligência MeConta</p>
             <p className="text-[11px] text-slate-400 leading-relaxed italic">Este documento foi sintetizado por inteligência artificial a partir de evidências comportamentais e avaliações anônimas de pares e mentoria.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TrajectoryReportView;
