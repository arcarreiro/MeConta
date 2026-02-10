
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store } from '../services/store';
import { ArrowLeft, Printer, BarChart3, Star, Target, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { BrandLogo } from '../App';
import { FeedbackRound, SynthesizedReport, CourseEvaluation } from '../types';

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
          
          // Correção: Buscar a rodada usando o round_id do relatório, não o targetId
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

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Carregando diagnóstico...</div>;
  if (!report || !round) return <div className="p-10 text-center font-bold text-slate-400">Relatório do curso não encontrado.</div>;

  // Cálculos de Médias
  const avgQ1 = evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + curr.q1.score, 0) / evaluations.length).toFixed(1) : "0";
  const avgQ2 = evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + curr.q2.score, 0) / evaluations.length).toFixed(1) : "0";

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-1000 pb-24">
      <div className="flex items-center justify-between no-print px-4">
        <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-amber-600 font-bold transition-all transform hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> Retornar ao Admin
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-amber-500 text-white px-8 py-4 rounded-3xl hover:shadow-2xl hover:shadow-amber-200 transition-all font-bold flex items-center gap-2"
        >
          <Printer className="w-5 h-5" /> Imprimir Diagnóstico
        </button>
      </div>

      <div className="bg-white border-[12px] border-amber-50/30 rounded-[4rem] shadow-2xl overflow-hidden p-16 md:p-24 space-y-20 relative print:border-none print:shadow-none print:p-0">
        <Sparkles className="absolute top-20 right-20 text-amber-100 w-40 h-40 opacity-20 pointer-events-none" />
        
        <header className="flex flex-col md:flex-row justify-between items-center border-b-2 border-slate-50 pb-16 gap-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-amber-200">
               <BarChart3 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Saúde da <br /><span className="text-amber-600">Aprendizagem</span></h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">NPS Pedagógico Consolidado • MeConta AI</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-3xl font-black text-slate-900">{round.name}</div>
            <div className="text-sm text-amber-500 font-bold mt-2">Sessão de Diagnóstico: {new Date(report.createdAt).toLocaleDateString()}</div>
            <div className="mt-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-black text-xs uppercase tracking-widest">{evaluations.length} Alunos Participantes</div>
          </div>
        </header>

        {/* Dashboard de Médias */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-emerald-50/80 p-10 rounded-[3rem] border border-emerald-100 relative group overflow-hidden">
             <Star className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-100" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-4">Clareza e Relevância</span>
             <div className="text-7xl font-black text-emerald-600">{avgQ1}</div>
             <div className="text-sm font-bold text-emerald-500 mt-2">Média de satisfação com o conteúdo</div>
          </div>
          <div className="bg-rose-50/80 p-10 rounded-[3rem] border border-rose-100 relative group overflow-hidden">
             <AlertCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-100" />
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-4">Fator de Dificuldade</span>
             <div className="text-7xl font-black text-rose-600">{avgQ2}</div>
             <div className="text-sm font-bold text-rose-500 mt-2">Índice de fricção no aprendizado</div>
          </div>
        </div>

        {/* Análise Qualitativa da IA */}
        <article className="space-y-12">
          <div className="flex items-center gap-4">
             <div className="h-0.5 flex-1 bg-slate-50"></div>
             <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Síntese Qualitativa da Turma</div>
             <div className="h-0.5 flex-1 bg-slate-50"></div>
          </div>
          
          <div className="prose prose-slate max-w-none">
             <div className="text-slate-700 text-2xl leading-[1.6] whitespace-pre-wrap font-medium font-serif">
                {report.content}
             </div>
          </div>
        </article>

        {/* Mural de Sugestões (Bruto ou Resumido) */}
        <section className="space-y-10">
           <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-amber-500" /> Sugestões Diretas da Turma
           </h2>
           <div className="grid md:grid-cols-2 gap-6">
              {evaluations.filter(e => !!e.q3.comment).slice(0, 10).map((ev, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-slate-600 text-sm italic font-medium">
                  "{ev.q3.comment}"
                </div>
              ))}
           </div>
        </section>

        <footer className="pt-20 border-t-2 border-slate-50 mt-20 flex flex-col items-center text-center space-y-6">
          <BrandLogo size="md" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Plataforma de Gestão de Aprendizagem MeConta</p>
        </footer>
      </div>
    </div>
  );
};

export default CourseReportView;
