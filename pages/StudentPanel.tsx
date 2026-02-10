
import React, { useState, useEffect } from 'react';
import { Store } from '../services/store';
import { FeedbackAssignment, SynthesizedReport, User, Role, FeedbackRound, CourseEvaluation, Group, RoundStatus } from '../types';
import { 
  Send, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  GraduationCap, 
  User as UserIcon, 
  Clock, 
  Star, 
  History, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  CalendarDays,
  Coffee
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentPanel: React.FC = () => {
  const me = Store.getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rounds, setRounds] = useState<FeedbackRound[]>([]);
  const [tasks, setTasks] = useState<FeedbackAssignment[]>([]);
  const [reports, setReports] = useState<SynthesizedReport[]>([]);
  const [pendingReportRoundIds, setPendingReportRoundIds] = useState<string[]>([]);
  const [monitorsInGroup, setMonitorsInGroup] = useState<User[]>([]);
  const [activeRounds, setActiveRounds] = useState<FeedbackRound[]>([]);
  
  const [evaluations, setEvaluations] = useState<Record<string, CourseEvaluation>>({});
  const [monitorFeedbackText, setMonitorFeedbackText] = useState<Record<string, string>>({});
  const [submittedMonitorIds, setSubmittedMonitorIds] = useState<string[]>([]);
  const [submittedCourseRoundIds, setSubmittedCourseRoundIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const [allAssignments, allGroups, allRounds, allReports, allUsers, allEvals] = await Promise.all([
        Store.getAssignments(),
        Store.getGroups(),
        Store.getRounds(),
        Store.getReports(),
        Store.getUsers(),
        Store.getCourseEvaluations()
      ]);

      setUsers(allUsers);
      setGroups(allGroups);
      setRounds(allRounds);

      const myGroup = allGroups.find(g => g.id === me?.groupId);
      const active = allRounds.filter(r => r.groupId === me?.groupId && (r.status === RoundStatus.ACTIVE || r.status === RoundStatus.UNDER_REVIEW));
      
      if (myGroup) {
        const monitors = allUsers.filter(u => myGroup.monitorIds.includes(u.id));
        setMonitorsInGroup(monitors);
      }
      
      setActiveRounds(active);
      setTasks(allAssignments.filter(a => a.giverId === me?.id && a.status === 'PENDING' && !a.isToMonitor));
      
      const myIndividualReports = allReports.filter(r => r.targetId === me?.id && r.type === 'STUDENT');
      setReports(myIndividualReports.filter(r => r.isApproved).sort((a,b) => b.createdAt - a.createdAt));
      
      const pendingIds = myIndividualReports
        .filter(r => !r.isApproved)
        .map(r => Array.isArray(r.roundId) ? r.roundId[0] : r.roundId);
      setPendingReportRoundIds(pendingIds);
      
      const myEvals = allEvals.filter(e => e.studentId === me?.id);
      const evalMap: Record<string, CourseEvaluation> = {};
      myEvals.forEach(e => evalMap[e.roundId] = e);
      setEvaluations(evalMap);
      setSubmittedCourseRoundIds(myEvals.map(e => e.roundId));

      const monitorFeedbacks = allAssignments.filter(a => a.giverId === me?.id && a.isToMonitor && a.status === 'SUBMITTED');
      setSubmittedMonitorIds(monitorFeedbacks.map(f => f.receiverId));
    } catch (err) {
      console.error("[StudentPanel] Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPeerFeedback = async (id: string) => {
    const text = (document.getElementById(`task-${id}`) as HTMLTextAreaElement).value;
    if (!text || text.length < 10) return alert('Por favor, escreva um feedback um pouco mais detalhado.');
    await Store.submitFeedback(id, text);
    refresh();
  };

  const handleMonitorFeedbackSubmit = async (roundId: string, monitorId: string) => {
    const text = monitorFeedbackText[monitorId];
    if (!text || text.length < 10) return alert('Por favor, escreva um feedback um pouco mais detalhado.');
    await Store.createStudentToMonitorFeedback(roundId, me?.id || '', monitorId, text);
    refresh();
  };

  const handleCourseEvalSubmit = async (roundId: string) => {
    const ev = evaluations[roundId];
    if (!ev) return;
    await Store.submitCourseEvaluation(ev);
    await refresh();
  };

  const updateEval = (roundId: string, field: 'q1' | 'q2' | 'q3', subfield: 'score' | 'comment', value: any) => {
    const current = evaluations[roundId] || {
      id: Math.random().toString(36).substr(2, 9),
      roundId,
      studentId: me?.id || '',
      q1: { score: 10, comment: '' },
      q2: { score: 0, comment: '' },
      q3: { score: 10, comment: '' }
    };
    setEvaluations({...evaluations, [roundId]: {...current, [field]: {...current[field], [subfield]: value}}});
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-violet-600" />
        <p className="text-slate-400 font-bold animate-pulse">Organizando seu painel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 animate-in fade-in duration-700 overflow-x-hidden">
      {/* Container Principal com Inversão de Ordem no Mobile */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        {/* Coluna Central / Conteúdo Principal (Primeira no Mobile) */}
        <div className="flex-1 order-1 lg:order-2 space-y-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Olá, {me?.name}! 👋</h1>
            <p className="text-slate-500 font-medium">Bem-vindo de volta ao seu espaço de crescimento.</p>
          </div>

          {/* Estado Vazio: Nenhuma Sprint Ativa */}
          {activeRounds.length === 0 && (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-12 md:p-20 text-center space-y-6 shadow-soft group hover:border-violet-200 transition-all">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
                  <Coffee className="w-12 h-12 text-slate-300 group-hover:text-violet-400" />
               </div>
               <div className="max-w-md mx-auto space-y-3">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tudo calmo por aqui!</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   No momento não há nenhuma **Sprint de Feedback** aberta para a sua turma. 
                   Aproveite este tempo para revisar seus relatórios passados ou focar nos seus estudos atuais.
                 </p>
               </div>
               <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-50 text-violet-600 rounded-full text-xs font-black uppercase tracking-widest">
                 <Clock className="w-4 h-4" /> Avisaremos quando uma nova começar
               </div>
            </div>
          )}

          {/* Listagem de Sprints Ativas */}
          {activeRounds.map(round => {
            const isPendingApproval = pendingReportRoundIds.includes(round.id);
            const isReview = round.status === RoundStatus.UNDER_REVIEW;
            
            return (
              <div key={round.id} className="space-y-10">
                {/* Banner de Status da Sprint */}
                <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-soft ${isPendingApproval ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : isReview ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-violet-50 border-violet-100 text-violet-900'}`}>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-soft shrink-0">
                        {isPendingApproval ? <Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> : isReview ? <CheckCircle2 className="w-8 h-8 text-amber-600" /> : <Clock className="w-8 h-8 text-violet-600" />}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase tracking-widest opacity-60 mb-1">{round.name}</div>
                        <div className="text-xl font-bold tracking-tight">
                          {isPendingApproval 
                            ? 'Sua síntese está sendo preparada pelo monitor.' 
                            : isReview 
                              ? 'Feedbacks enviados! Aguarde a consolidação.' 
                              : 'Sprint aberta! Sua contribuição é fundamental.'}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Seções de Feedback (Apenas se não estiver pendente/review) */}
                {round.status === RoundStatus.ACTIVE && !isPendingApproval && (
                  <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                    {/* Mentoria */}
                    <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-soft">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
                             <GraduationCap className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apoio da Mentoria</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {monitorsInGroup.map(m => (
                             <div key={m.id} className="p-6 bg-slate-50 rounded-[2rem] flex flex-col gap-4 border border-transparent hover:border-violet-100 transition-all">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                                       <UserIcon className="w-5 h-5" />
                                     </div>
                                     <span className="font-black text-slate-900">{m.name}</span>
                                  </div>
                                  {submittedMonitorIds.includes(m.id) && (
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> OK</span>
                                  )}
                                </div>
                                {!submittedMonitorIds.includes(m.id) && (
                                  <>
                                    <textarea className="w-full rounded-2xl border-0 p-4 text-sm font-medium h-24 bg-white shadow-inner focus:ring-2 focus:ring-violet-200 transition-all" placeholder="O que o monitor pode fazer para melhorar sua experiência?" value={monitorFeedbackText[m.id] || ''} onChange={(e) => setMonitorFeedbackText({...monitorFeedbackText, [m.id]: e.target.value})} />
                                    <button onClick={() => handleMonitorFeedbackSubmit(round.id, m.id)} className="bg-slate-900 hover:bg-violet-600 text-white py-3 rounded-xl text-xs font-black transition-all shadow-soft active:scale-95">Enviar ao Mentor</button>
                                  </>
                                )}
                             </div>
                           ))}
                        </div>
                    </section>

                    {/* Conteúdo do Curso */}
                    <section className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-8 shadow-soft">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                             <Star className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Qualidade do Conteúdo</h2>
                        </div>
                        {!submittedCourseRoundIds.includes(round.id) ? (
                          <div className="space-y-6">
                             <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6 border border-slate-100">
                                <div className="flex justify-between items-center">
                                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nível de Satisfação</label>
                                   <span className="text-4xl font-black text-amber-600">{evaluations[round.id]?.q1.score ?? 10}</span>
                                </div>
                                <input type="range" min="0" max="10" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" value={evaluations[round.id]?.q1.score ?? 10} onChange={(e) => updateEval(round.id, 'q1', 'score', parseInt(e.target.value))} />
                                <textarea className="w-full bg-white border-0 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-amber-200 h-24 shadow-inner" placeholder="Algum tópico foi difícil de entender? O que você mais gostou?" value={evaluations[round.id]?.q1.comment || ''} onChange={(e) => updateEval(round.id, 'q1', 'comment', e.target.value)} />
                             </div>
                             <button onClick={() => handleCourseEvalSubmit(round.id)} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-amber-100 transition-all active:scale-[0.98]">Salvar Avaliação do Curso</button>
                          </div>
                        ) : (
                          <div className="text-center p-12 bg-emerald-50 text-emerald-700 font-black rounded-[2rem] border border-emerald-100 flex flex-col items-center gap-3">
                             <CheckCircle2 className="w-12 h-12" />
                             Feedbacks de conteúdo salvos com sucesso.
                          </div>
                        )}
                    </section>

                    {/* Pares */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 px-2">
                          <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600">
                             <MessageSquare className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Avaliação de Pares</h2>
                        </div>
                        <div className="grid gap-6">
                          {tasks.filter(t => t.roundId === round.id).map(task => {
                            const rcv = users.find(u => u.id === task.receiverId);
                            return (
                              <div key={task.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-6 shadow-soft hover:border-cyan-100 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg border border-slate-100 shadow-inner">
                                      {rcv?.name.charAt(0)}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Feedback para {rcv?.name}</h3>
                                 </div>
                                 <textarea id={`task-${task.id}`} className="w-full bg-slate-50 border-0 rounded-[2rem] p-6 h-40 text-slate-700 font-medium focus:ring-2 focus:ring-cyan-200 transition-all shadow-inner" placeholder="O que você admira no trabalho deste colega? O que ele poderia fazer de diferente na próxima sprint?" />
                                 <button onClick={() => handleSubmitPeerFeedback(task.id)} className="w-full bg-slate-900 hover:bg-cyan-600 text-white py-5 rounded-2xl font-black transition-all shadow-soft active:scale-95 flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Enviar para {rcv?.name.split(' ')[0]}
                                 </button>
                              </div>
                            );
                          })}
                        </div>
                        {tasks.filter(t => t.roundId === round.id).length === 0 && (
                          <div className="p-16 text-center bg-white border border-slate-100 rounded-[3rem] text-slate-300 font-black uppercase tracking-[0.2em] italic shadow-soft">
                             Sua lista de tarefas está em dia! ✨
                          </div>
                        )}
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar de Histórico (Segunda no Mobile) */}
        <aside className="w-full lg:w-80 shrink-0 order-2 lg:order-1 space-y-8">
          <div className="flex items-center gap-3 px-2">
            <History className="w-6 h-6 text-violet-600" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Meus Relatórios</h2>
          </div>
          
          <div className="relative ml-4 space-y-8 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
            {reports.map((report, index) => {
              const reportRoundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
              const round = rounds.find(r => r.id === reportRoundId);
              return (
                <div key={report.id} className="relative flex items-start group">
                  <div className={`absolute left-0 mt-1.5 w-4 h-4 rounded-full border-4 border-white shadow-soft ring-2 transition-all group-hover:scale-125 ${index === 0 ? 'bg-violet-600 ring-violet-100' : 'bg-slate-300 ring-slate-50'}`}></div>
                  <div className="ml-10 w-full transform transition-transform group-hover:translate-x-1">
                    <Link to={`/report/${report.id}`} className="block p-5 rounded-3xl bg-white border border-slate-100 shadow-soft hover:shadow-xl hover:border-violet-200 transition-all">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                         <CalendarDays className="w-3 h-3" />
                         {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                       </div>
                       <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">{round?.name || 'Sprint Concluída'}</h3>
                       <div className="mt-3 flex items-center text-[10px] font-black text-violet-600 gap-1 uppercase tracking-wider">
                         Ver Detalhes <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                       </div>
                    </Link>
                  </div>
                </div>
              );
            })}
            {reports.length === 0 && (
              <div className="ml-10 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-xs text-slate-400 font-bold italic leading-relaxed">
                Aqui aparecerão suas sínteses consolidadas pela IA após cada Sprint.
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default StudentPanel;
