
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../services/store';
import { ArrowLeft, Printer, GraduationCap, Sparkles } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { User, SynthesizedReport } from '../types';

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

  if (loading) return <div className="p-10 text-center font-bold">Carregando relatório...</div>;
  if (!report) return <div className="p-10 text-center font-bold">Relatório não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="flex items-center justify-between no-print">
        <Link to="/monitor" className="flex items-center gap-2 text-slate-400 hover:text-orange-600 font-bold transition-all transform hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> Painel de Mentoria
        </Link>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-all font-bold shadow-lg shadow-orange-100"
        >
          <Printer className="w-4 h-4" /> Baixar PDF de Impacto
        </button>
      </div>

      <div className="bg-white border-2 border-orange-50 rounded-[3rem] shadow-2xl overflow-hidden p-12 md:p-20 space-y-16 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b border-orange-50 pb-12 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
               <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Impacto da <span className="text-orange-500">Mentoria</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Análise Pedagógica MeConta</p>
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black rounded-full uppercase tracking-widest mb-2">Monitoria Consolidada</div>
            <div className="text-sm text-slate-900 font-bold">{new Date(report.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-orange-50">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Mentor(a) Analisado(a)</span>
            <div className="text-2xl font-black text-slate-900">{monitor?.name}</div>
        </div>

        <section className="space-y-6 relative overflow-hidden">
          <Sparkles className="absolute top-0 right-0 text-orange-100 w-20 h-20 opacity-40" />
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 relative z-10">
            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
            Percepção dos Alunos e Impacto
          </h2>
          <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-medium relative z-10">
            {report.content}
          </div>
        </section>

        <footer className="pt-16 border-t border-slate-50 mt-12 flex flex-col items-center text-center space-y-4">
          <BrandLogo size="sm" />
          <div className="space-y-1">
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Tecnologia MeConta - Apoio à Excelência Docente</p>
             <p className="text-[10px] text-slate-300 italic">Relatório gerado a partir de feedbacks anônimos coletados durante a rodada de orientação.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MonitorReportView;
