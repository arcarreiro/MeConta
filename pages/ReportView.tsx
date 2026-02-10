
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../services/store';
import { Mail, ArrowLeft, Printer, Sparkles } from 'lucide-react';
import { BrandLogo } from '../App';
import { User, SynthesizedReport, Group } from '../types';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Carregando relatório...</div>;
  if (!report) return <div className="p-10 text-center font-bold text-slate-400">Relatório extraviado. Contate o suporte.</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert(`Enviando cópia digital para ${user?.email}...`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="flex items-center justify-between no-print px-4 md:px-0">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-violet-600 font-bold transition-all transform hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> Voltar ao Painel
        </Link>
        <div className="flex gap-4">
          <button 
            onClick={handleEmail}
            className="hidden md:flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-soft"
          >
            <Mail className="w-4 h-4" /> Enviar Cópia
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-2xl transition-all font-black shadow-brand active:scale-95"
          >
            <Printer className="w-4 h-4" /> Baixar PDF
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-soft overflow-hidden p-12 md:p-24 space-y-16 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b border-slate-50 pb-12 gap-8">
          <div className="flex items-center gap-5">
            <BrandLogo size="lg" />
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Relatório <span className="text-violet-600">Individual</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Sessão de Desenvolvimento MeConta</p>
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <div className="inline-block px-4 py-1.5 bg-violet-50 text-violet-700 text-[10px] font-black rounded-full uppercase tracking-widest mb-3 border border-violet-100">Documento Verificado</div>
            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Protocolo: #{report.id.substr(0,8)}</div>
            <div className="text-base text-slate-900 font-black">{new Date(report.createdAt).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Membro Avaliado</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</div>
            <div className="text-slate-500 font-bold mt-1">{user?.email}</div>
          </div>
          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-4">Contexto de Feedback</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">Cultura 360°</div>
            <div className="text-slate-500 font-bold mt-1">Turma: {groups.find(g => g.id === user?.groupId)?.name}</div>
          </div>
        </div>

        <section className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-1.5 h-10 bg-violet-600 rounded-full shadow-brand"></div>
            Síntese de Performance
          </h2>
          <div className="prose prose-slate max-w-none text-slate-700 text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {report.content}
          </div>
        </section>

        <section className="space-y-8 bg-violet-50 p-12 rounded-[3rem] border border-violet-100 relative overflow-hidden shadow-inner">
          <Sparkles className="absolute top-8 right-8 text-violet-200 w-16 h-16 opacity-30" />
          <h2 className="text-2xl font-black text-violet-900 flex items-center gap-3 relative z-10">
            Insights de Evolução
          </h2>
          <div className="text-violet-800 text-lg leading-relaxed whitespace-pre-wrap font-bold relative z-10 italic">
            {report.evolution}
          </div>
        </section>

        <footer className="pt-20 border-t border-slate-100 mt-12 flex flex-col items-center text-center space-y-6">
          <BrandLogo size="sm" />
          <div className="space-y-2">
             <p className="text-slate-400 font-black text-xs uppercase tracking-[0.4em]">Propriedade da Plataforma MeConta AI</p>
             <p className="text-[10px] text-slate-300 font-medium italic">Este documento é confidencial e destinado exclusivamente ao desenvolvimento pessoal do aluno.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReportView;
