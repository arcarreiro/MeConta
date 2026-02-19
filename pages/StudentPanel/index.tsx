
import React, { useState, useEffect } from 'react';
import { Store } from '../../services/store';
import { FeedbackAssignment, SynthesizedReport, User, FeedbackRound, CourseEvaluation, Group, RoundStatus } from '../../types';
import { 
  Clock, 
  Loader2, 
  CheckCircle2,
  Coffee
} from 'lucide-react';
import { MentoringSection } from '../../components/student/MentoringSection';
import { CourseQualitySection } from '../../components/student/CourseQualitySection';
import { PeersSection } from '../../components/student/PeersSection';
import { ReportsTimeline } from '../../components/student/ReportsTimeline';
import './style.css';

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
      <div className="student-loading">
        <Loader2 className="student-loading__icon" />
        <p className="student-loading__text">Organizando seu painel...</p>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-layout">
        
        <div className="student-main">
          <div className="student-welcome">
            <h1 className="student-welcome__title">Olá, {me?.name}! 👋</h1>
            <p className="student-welcome__subtitle">Seu progresso é a nossa maior missão.</p>
          </div>

          {activeRounds.length === 0 && (
            <div className="student-no-rounds">
               <div className="student-no-rounds__icon-wrapper">
                  <Coffee className="student-no-rounds__icon" />
               </div>
               <div className="student-no-rounds__content">
                 <h2 className="student-no-rounds__title">Tudo calmo por aqui!</h2>
                 <p className="student-no-rounds__subtitle">
                   Aguarde o monitor lançar a próxima Sprint de Feedback.
                 </p>
               </div>
            </div>
          )}

          {activeRounds.map(round => {
            const isPendingApproval = pendingReportRoundIds.includes(round.id);
            const isReview = round.status === RoundStatus.UNDER_REVIEW;
            const submittedMonitors = submittedMonitorIdsByRound[round.id] || [];
            
            return (
              <div key={round.id} className="student-round-container">
                <div className={`student-status-banner ${isPendingApproval ? 'student-status-banner--pending' : isReview ? 'student-status-banner--review' : 'student-status-banner--active'}`}>
                   <div className="student-status-banner__content">
                      <div className="student-status-banner__icon-wrapper">
                        {isPendingApproval ? <Loader2 className="animate-spin" /> : isReview ? <CheckCircle2 /> : <Clock />}
                      </div>
                      <div>
                        <div className="student-status-banner__label">{round.name}</div>
                        <div className="student-status-banner__title">
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
                  <div className="student-round-actions">
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
