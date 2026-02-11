
import React, { useState, useEffect } from 'react';
import { Store } from '../services/store';
import { FeedbackAssignment, SynthesizedReport, User, FeedbackRound, CourseEvaluation, Group, RoundStatus } from '../types';
import { 
  Clock, 
  Loader2, 
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { MentoringSection } from '../components/student/MentoringSection';
import { CourseQualitySection } from '../components/student/CourseQualitySection';
import { PeersSection } from '../components/student/PeersSection';
import { ReportsTimeline } from '../components/student/ReportsTimeline';

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
  const [peerFeedbackText, setPeerFeedbackText] = useState<Record<string, string>>({});
  
  // Mapeamento de feedbacks de monitor por RoundID -> [MonitorID, MonitorID...]
  const [submittedMonitorIdsByRound, setSubmittedMonitorIdsByRound] = useState<Record<string, string[]>>({});
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

      // Organizar feedbacks de monitor por rodada
      const monitorFeedbacks = allAssignments.filter(a => a.giverId === me?.id && a.isToMonitor && a.status === 'SUBMITTED');
      const monitorMap: Record<string, string[]> = {};
      monitorFeedbacks.forEach(f => {
        if (!monitorMap[f.roundId]) monitorMap[f.roundId] = [];
        monitorMap[f.roundId].push(f.receiverId);
      });
      setSubmittedMonitorIdsByRound(monitorMap);

    } catch (err) {
      console.error("[StudentPanel] Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPeerFeedback = async (id: string, text: string) => {
    if (!text || text.length < 10) {
      alert('Por favor, escreva um feedback um pouco mais detalhado.');
      return;
    }
    await Store.submitFeedback(id, text);
    setPeerFeedbackText(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    refresh();
  };

  const handleMonitorFeedbackSubmit = async (roundId: string, monitorId: string) => {
    const text = monitorFeedbackText[monitorId];
    if (!text || text.length < 10) return alert('Por favor, escreva um feedback um pouco mais detalhado.');
    await Store.createStudentToMonitorFeedback(roundId, me?.id || '', monitorId, text);
    
    // Limpar texto após envio bem sucedido
    setMonitorFeedbackText(prev => {
      const next = { ...prev };
      delete next[monitorId];
      return next;
    });
    
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
      q2: { score: 5, comment: '' },
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
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        <div className="flex-1 order-1 lg:order-2 space-y-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Olá, {me?.name}! 👋</h1>
            <p className="text-slate-500 font-medium">Seu progresso é a nossa maior missão.</p>
          </div>

          {activeRounds.length === 0 && (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-12 md:p-20 text-center space-y-6 shadow-soft group hover:border-violet-200 transition-all">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
                  <Coffee className="w-12 h-12 text-slate-300 group-hover:text-violet-400" />
               </div>
               <div className="max-w-md mx-auto space-y-3">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tudo calmo por aqui!</h2>
                 <p className="text-slate-500 font-medium leading-relaxed">
                   Aguarde o monitor lançar a próxima Sprint de Feedback.
                 </p>
               </div>
            </div>
          )}

          {activeRounds.map(round => {
            const isPendingApproval = pendingReportRoundIds.includes(round.id);
            const isReview = round.status === RoundStatus.UNDER_REVIEW;
            const submittedMonitors = submittedMonitorIdsByRound[round.id] || [];
            const hasRequirementMet = submittedMonitors.length > 0;
            
            return (
              <div key={round.id} className="space-y-10">
                <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 shadow-soft ${isPendingApproval ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : isReview ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-violet-50 border-violet-100 text-violet-900'}`}>
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-soft shrink-0">
                        {isPendingApproval ? <Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> : isReview ? <CheckCircle2 className="w-8 h-8 text-amber-600" /> : <Clock className="w-8 h-8 text-violet-600" />}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase tracking-widest opacity-60 mb-1">{round.name}</div>
                        <div className="text-xl font-bold tracking-tight">
                          {isPendingApproval 
                            ? 'Aguardando revisão do monitor...' 
                            : isReview 
                              ? 'Feedbacks coletados. Em processamento pela IA.' 
                              : 'Sprint em andamento. Complete suas tarefas abaixo.'}
                        </div>
                      </div>
                   </div>
                </div>

               {round.status === RoundStatus.ACTIVE && !isPendingApproval && (
                  <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
                    
                    <MentoringSection
                      round={round}
                      monitorsInGroup={monitorsInGroup}
                      submittedMonitorIds={submittedMonitors}
                      monitorFeedbackText={monitorFeedbackText}
                      onChangeText={(monitorId, value) =>
                        setMonitorFeedbackText((prev) => ({ ...prev, [monitorId]: value }))
                      }
                      onSubmit={handleMonitorFeedbackSubmit}
                    />

                    <CourseQualitySection
                      roundId={round.id}
                      evaluation={evaluations[round.id]}
                      submitted={submittedCourseRoundIds.includes(round.id)}
                      onUpdateEval={updateEval}
                      onSubmit={handleCourseEvalSubmit}
                    />

                    <PeersSection
                      tasks={tasks}
                      users={users}
                      roundId={round.id}
                      feedbackText={peerFeedbackText}
                      onChangeText={(taskId, value) =>
                        setPeerFeedbackText((prev) => ({ ...prev, [taskId]: value }))
                      }
                      onSubmit={handleSubmitPeerFeedback}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ReportsTimeline reports={reports} rounds={rounds} />

      </div>
    </div>
  );
};

export default StudentPanel;
