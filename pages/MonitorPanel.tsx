
import React, { useState, useEffect } from 'react';
import { Store } from '../services/store';
import { Group, User, FeedbackRound, FeedbackAssignment, Role, SynthesizedReport, RoundStatus, CourseEvaluation } from '../types';
import {
  Loader2,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  Plus,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  CheckCircle,
  Send,
  MessageSquare,
  Trash2,
  UserCheck,
  Users
} from 'lucide-react';
import { synthesizeFeedback, synthesizeMonitorFeedback } from '../services/gemini';
import { Toast } from '../components/ui/Toast';
import { DeleteRoundModal } from '../components/modals/DeleteRoundModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { TasksQueue } from '../components/monitor/TasksQueue';
import { ApprovalQueue } from '../components/monitor/ApprovalQueue';

const MonitorPanel: React.FC = () => {
  const me = Store.getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeRounds, setActiveRounds] = useState<FeedbackRound[]>([]);
  const [assignments, setAssignments] = useState<FeedbackAssignment[]>([]);
  const [reports, setReports] = useState<SynthesizedReport[]>([]);
  const [courseEvaluations, setCourseEvaluations] = useState<CourseEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchProcessing, setBatchProcessing] = useState<string | null>(null);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null);
  const [configGroupId, setConfigGroupId] = useState<string | null>(null);
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDeadline, setNewRoundDeadline] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [reportToApprove, setReportToApprove] = useState<{ id: string; roundId: string } | null>(null);
  const [refinementText, setRefinementText] = useState<Record<string, string>>({});
  const [taskText, setTaskText] = useState<Record<string, string>>({});

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [allGroups, allUsers, allRounds, allAssignments, allReports, allEvals] = await Promise.all([
        Store.getGroups(),
        Store.getUsers(),
        Store.getRounds(),
        Store.getAssignments(),
        Store.getReports(),
        Store.getCourseEvaluations()
      ]);
      const myGroups = allGroups.filter(g => g.monitorIds.includes(me?.id || '') || me?.role === Role.ADMIN);
      setUsers(allUsers);
      setGroups(myGroups);
      setActiveRounds(allRounds.filter(r => myGroups.some(g => g.id === r.groupId)));
      setAssignments(allAssignments);
      setReports(allReports);
      setCourseEvaluations(allEvals);
    } catch (err) {
      console.error("Error refreshing monitor data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRound = async (groupId: string) => {
    if (!newRoundName || !newRoundDeadline) return showToast('Preencha os campos.', 'error');

    // Validação de Sprint em Aberto
    const openRound = activeRounds.find(r => 
      r.groupId === groupId && 
      (r.status === RoundStatus.ACTIVE || r.status === RoundStatus.UNDER_REVIEW)
    );

    if (openRound) {
      return showToast(`Já existe uma sprint em aberto (${openRound.name}) para esta turma. Finalize-a antes de iniciar uma nova.`, 'error');
    }

    try {
      const deadlineTimestamp = new Date(newRoundDeadline).getTime();
      await Store.startRound(groupId, newRoundName, deadlineTimestamp);
      setConfigGroupId(null);
      setNewRoundName('');
      setNewRoundDeadline('');
      await refreshData();
      showToast('Sprint iniciada com sucesso!');
    } catch (err: any) {
      showToast("Erro: " + err.message, 'error');
    }
  };

  const handleConfirmDeleteRound = async () => {
    if (!deletingRoundId) return;
    setLoading(true);
    try {
      await Store.deleteRound(deletingRoundId);
      showToast('Sprint excluída com sucesso.');
      setDeletingRoundId(null);
      await refreshData();
    } catch (err: any) {
      showToast("Erro ao excluir: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllReports = async (roundId: string) => {
    const round = activeRounds.find(r => r.id === roundId);
    if (!round) return;

    setBatchProcessing(roundId);
    showToast('Iniciando síntese com Gemini AI...', 'success');

    try {
      const students = users.filter(u => u.groupId === round.groupId && u.role === Role.STUDENT);
      const monitorsOfGroup = groups.find(g => g.id === round.groupId)?.monitorIds || [];
      const monitors = users.filter(u => monitorsOfGroup.includes(u.id));

      for (const student of students) {
        const relevantFeedbacks = assignments
          .filter(a => a.roundId === roundId && a.receiverId === student.id && !a.isToMonitor)
          .map(a => a.content)
          .filter(c => !!c && c.length > 2);

        if (relevantFeedbacks.length > 0) {
          const prevReportsList = reports.filter(r => r.targetId === student.id && r.type === 'STUDENT').sort((a, b) => b.createdAt - a.createdAt);
          const prevText = prevReportsList.length > 0 ? prevReportsList[0].content : '';
          const result = await synthesizeFeedback(student.name, relevantFeedbacks, prevText);

          await Store.addReport({
            targetId: student.id,
            roundId,
            content: result.summary,
            evolution: result.evolution_analysis,
            type: 'STUDENT',
            isApproved: false
          });
        }
      }

      for (const monitor of monitors) {
        const relevantFeedbacks = assignments
          .filter(a => a.roundId === roundId && a.receiverId === monitor.id && a.isToMonitor)
          .map(a => a.content)
          .filter(c => !!c && c.length > 2);

        if (relevantFeedbacks.length > 0) {
          const result = await synthesizeMonitorFeedback(monitor.name, relevantFeedbacks);
          await Store.addReport({
            targetId: monitor.id,
            roundId: roundId,
            content: result.summary,
            type: 'MONITOR',
            isApproved: true
          });
        }
      }

      await Store.updateRoundStatus(roundId, RoundStatus.UNDER_REVIEW);
      showToast('Todos os relatórios foram gerados para sua revisão.');
      await refreshData();
    } catch (error: any) {
      showToast(`Erro na geração: ${error.message}`, 'error');
    } finally {
      setBatchProcessing(null);
    }
  };

  const handleApproveReport = async () => {
    if (!reportToApprove) return;
    const { id: reportId, roundId } = reportToApprove;

    setApprovingId(reportId);
    try {
      await Store.approveReport(reportId);

      setReports(prev => prev.map(r => r.id === reportId ? { ...r, isApproved: true } : r));

      const allReports = await Store.getReports();
      const pendingsOfRound = allReports.filter(r => {
        const rId = Array.isArray(r.roundId) ? r.roundId[0] : r.roundId;
        return rId === roundId && r.type === 'STUDENT' && !r.isApproved && r.id !== reportId;
      });

      if (pendingsOfRound.length === 0) {
        await Store.completeRound(roundId);
        showToast('Sprint finalizada e arquivada.');
      } else {
        showToast('Relatório aprovado e enviado ao aluno.');
      }

      setReportToApprove(null);
      setExpandedReportId(null);
      await refreshData();
    } catch (err: any) {
      showToast("Falha técnica: " + err.message, 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRefineReport = async (report: SynthesizedReport) => {
    const instructions = refinementText[report.id];
    if (!instructions) return showToast("Por favor, descreva o que deseja ajustar.", "error");

    setRefiningId(report.id);
    try {
      const student = users.find(u => u.id === report.targetId);
      const roundId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
      const relevantFeedbacks = assignments
        .filter(a => a.roundId === roundId && a.receiverId === report.targetId && !a.isToMonitor)
        .map(a => a.content)
        .filter(c => !!c && c.length > 2);

      const result = await synthesizeFeedback(
        student?.name || "Aluno",
        relevantFeedbacks,
        undefined,
        instructions,
        report.content
      );

      await Store.updateReport(report.id, {
        content: result.summary,
        evolution: result.evolution_analysis
      });

      setRefinementText(prev => ({ ...prev, [report.id]: '' }));
      showToast("Relatório ajustado com IA!");
      await refreshData();
    } catch (err: any) {
      showToast("Falha no refinamento: " + err.message, "error");
    } finally {
      setRefiningId(null);
    }
  };

  const handleSubmitTask = async (taskId: string) => {
    const text = taskText[taskId];
    if (!text || text.length < 10) return showToast("Por favor, preencha um feedback construtivo.", "error");

    try {
      await Store.submitFeedback(taskId, text);
      showToast("Feedback enviado com sucesso!");
      setExpandedTaskId(null);
      await refreshData();
    } catch (err: any) {
      showToast("Erro ao enviar feedback: " + err.message, "error");
    }
  };

  const roundBeingDeleted = activeRounds.find(r => r.id === deletingRoundId);

  // Filtros para o Painel Lateral
  const myPendingTasks = assignments.filter(a => a.giverId === me?.id && a.status === 'PENDING' && a.isFromMonitor);
  const reportsForApproval = reports.filter(r => r.type === 'STUDENT' && !r.isApproved);

  // Determina se devemos focar em tarefas ou aprovações
  const hasActiveCollectingRound = activeRounds.some(r => r.status === RoundStatus.ACTIVE);
  const showTasksFirst = hasActiveCollectingRound && myPendingTasks.length > 0;

  // Monitoramento de Engajamento
  const getStudentsWithPendingTasks = (round: FeedbackRound) => {
    const groupStudents = users.filter(u => u.groupId === round.groupId && u.role === Role.STUDENT);
    const roundAssignments = assignments.filter(a => a.roundId === round.id);
    const roundEvals = courseEvaluations.filter(e => String(e.roundId) === String(round.id));

    return groupStudents.map(student => {
      const peerPendingCount = roundAssignments.filter(a => a.giverId === student.id && !a.isToMonitor && a.status === 'PENDING').length;
      const hasMonitorFeedback = roundAssignments.some(a => a.giverId === student.id && a.isToMonitor && a.status === 'SUBMITTED');
      const hasCourseEval = roundEvals.some(e => e.studentId === student.id);

      return {
        student,
        peerPendingCount,
        missingMonitor: !hasMonitorFeedback,
        missingCourse: !hasCourseEval,
        isFullyPending: peerPendingCount > 0 || !hasMonitorFeedback || !hasCourseEval
      };
    }).filter(s => s.isFullyPending);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!reportToApprove}
        title="Deseja aprovar este relatório?"
        loading={!!approvingId}
        onConfirm={handleApproveReport}
        onCancel={() => setReportToApprove(null)}
      />

      <DeleteRoundModal
        isOpen={!!deletingRoundId}
        roundName={roundBeingDeleted?.name || ''}
        onConfirm={handleConfirmDeleteRound}
        onCancel={() => setDeletingRoundId(null)}
        loading={loading && !!deletingRoundId}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Mentoria</h1>
          <p className="text-slate-500 font-medium mt-2">Acompanhe o progresso das turmas e revise os relatórios.</p>
        </div>
        <button onClick={refreshData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-violet-600 transition-all shadow-soft flex items-center gap-2 font-bold text-sm">
          <RefreshCw className="w-5 h-5" /> Sincronizar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Lado Esquerdo: Gestão de Sprints */}
        <div className="space-y-12">
          <div className="space-y-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
              <Clock className="w-6 h-6 text-violet-600" /> Atividades das Turmas
            </h2>
            {groups.map(group => {
              const groupRounds = activeRounds.filter(r => r.groupId === group.id);
              const hasOpenSprint = groupRounds.some(r => r.status === RoundStatus.ACTIVE || r.status === RoundStatus.UNDER_REVIEW);
              return (
                <div key={group.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-soft space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight">{group.name}</h3>
                    <button
                      onClick={() => setConfigGroupId(configGroupId === group.id ? null : group.id)}
                      className={`p-3 rounded-2xl transition-all shadow-soft border ${configGroupId === group.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:text-violet-600 hover:border-violet-100'}`}
                    >
                      {configGroupId === group.id ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </button>
                  </div>

                  {configGroupId === group.id && (
                    <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4 animate-in zoom-in-95 border border-slate-100 shadow-inner">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lançar Nova Sprint</p>
                        {hasOpenSprint && (
                          <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Turma já possui sprint ativa
                          </span>
                        )}
                      </div>
                      <input type="text" placeholder="Ex: Sprint 01 - Onboarding" className="w-full rounded-2xl px-6 py-4 border-0 shadow-soft font-bold focus:ring-2 focus:ring-violet-500" value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} disabled={hasOpenSprint} />
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase ml-1">Data de Encerramento</label>
                        <input type="date" className="w-full rounded-2xl px-6 py-4 border-0 shadow-soft font-bold focus:ring-2 focus:ring-violet-500" value={newRoundDeadline} onChange={(e) => setNewRoundDeadline(e.target.value)} disabled={hasOpenSprint} />
                      </div>
                      <button onClick={() => handleStartRound(group.id)} disabled={hasOpenSprint} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-2xl shadow-brand transition-all active:scale-95 disabled:opacity-30 disabled:grayscale">
                        {hasOpenSprint ? 'Finalize a sprint anterior primeiro' : 'Lançar para Alunos'}
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {groupRounds.map(round => {
                      const roundAssignments = assignments.filter(a => a.roundId === round.id && !a.isToMonitor);
                      const submittedCount = roundAssignments.filter(s => s.status === 'SUBMITTED').length;

                      const isReview = round.status === RoundStatus.UNDER_REVIEW;
                      const isCompleted = round.status === RoundStatus.COMPLETED;
                      const isActive = round.status === RoundStatus.ACTIVE;

                      return (
                        <div key={round.id} className={`p-6 rounded-3xl border transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-100 opacity-70' : isReview ? 'bg-white border-amber-200 shadow-md' : 'bg-slate-50 border-transparent'}`}>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-lg tracking-tight">{round.name}</span>
                                {!isCompleted && (
                                  <button
                                    onClick={() => setDeletingRoundId(round.id)}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                    title="Excluir Sprint"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 mt-0.5">{submittedCount} de {roundAssignments.length} entregas realizadas</span>
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase flex items-center gap-2 ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isReview ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                              {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {isCompleted ? 'Finalizada' : isReview ? 'Em Revisão' : 'Coletando'}
                            </span>
                          </div>

                          {isActive && (
                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                              <button
                                onClick={() => handleGenerateAllReports(round.id)}
                                disabled={batchProcessing === round.id || submittedCount === 0}
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-violet-600 transition-all flex items-center gap-2 shadow-soft disabled:opacity-30"
                              >
                                {batchProcessing === round.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Consolidar IA
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {groupRounds.length === 0 && <div className="py-10 text-center text-slate-300 font-bold italic bg-slate-50 rounded-3xl border border-dashed border-slate-200">Aguardando lançamento de sprints.</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MONITORAMENTO DE ENGAJAMENTO (COBRANÇA) */}
          <section className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
              <UserCheck className="w-6 h-6 text-rose-600" /> Cobrança de Preenchimento
            </h2>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-soft overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-rose-50/30">
                <p className="text-sm text-rose-900 font-medium">Alunos que ainda possuem tarefas obrigatórias pendentes nas sprints ativas.</p>
              </div>
              <div className="divide-y divide-slate-50">
                {activeRounds.filter(r => r.status === RoundStatus.ACTIVE).map(round => {
                  const pendings = getStudentsWithPendingTasks(round);
                  if (pendings.length === 0) return null;

                  return (
                    <div key={round.id} className="p-8 space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint:</span>
                        <span className="text-sm font-black text-slate-900">{round.name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendings.map(({ student, peerPendingCount, missingMonitor, missingCourse }) => (
                          <div key={student.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm shrink-0 overflow-hidden">
                                {student.photoUrl ? <img src={student.photoUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-900 truncate">{student.name}</div>
                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                  {peerPendingCount > 0 && (
                                    <span className="text-[8px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase">{peerPendingCount} Pares</span>
                                  )}
                                  {missingMonitor && (
                                    <span className="text-[8px] font-black bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded uppercase">Mentoria</span>
                                  )}
                                  {missingCourse && (
                                    <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Curso</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => showToast(`Cobrança enviada para ${student.name.split(' ')[0]}!`)} className="p-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {activeRounds.filter(r => r.status === RoundStatus.ACTIVE).every(r => getStudentsWithPendingTasks(r).length === 0) && (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Todos os alunos estão em dia!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Lado Direito Contextual: Tarefas (Coleta) ou Aprovações (Revisão) */}
        <div className="space-y-8">
          {showTasksFirst ? (
            <TasksQueue
              tasks={myPendingTasks}
              users={users}
              rounds={activeRounds}
              expandedTaskId={expandedTaskId}
              taskText={taskText}
              onToggleExpand={setExpandedTaskId}
              onChangeTaskText={(taskId, value) =>
                setTaskText((prev) => ({ ...prev, [taskId]: value }))
              }
              onSubmitTask={handleSubmitTask}
            />
          ) : (
            <ApprovalQueue
              reports={reportsForApproval}
              users={users}
              rounds={activeRounds}
              refinementText={refinementText}
              refiningId={refiningId}
              expandedReportId={expandedReportId}
              onToggleExpand={setExpandedReportId}
              onChangeRefinement={(id, value) =>
                setRefinementText((prev) => ({ ...prev, [id]: value }))
              }
              onRefine={handleRefineReport}
              onApproveClick={(reportId, roundId) =>
                setReportToApprove({ id: reportId, roundId })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitorPanel;