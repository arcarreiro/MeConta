
import React, { useState, useEffect } from 'react';
import { Store } from '../../services/store';
import { Group, User, FeedbackRound, FeedbackAssignment, Role, SynthesizedReport, RoundStatus, CourseEvaluation } from '../../types';
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
  Star,
  Trash2,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { synthesizeFeedback, synthesizeMonitorFeedback } from '../../services/gemini';
import { Toast } from '../../components/ui/Toast';
import { DeleteRoundModal } from '../../components/modals/DeleteRoundModal';
import { ConfirmModal } from '../../components/modals/ConfirmModal';
import { TasksQueue } from '../../components/monitor/TasksQueue';
import { ApprovalQueue } from '../../components/monitor/ApprovalQueue';
import './style.css';

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
  const [showMyFeedbacks, setShowMyFeedbacks] = useState(false);
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

      // Safety Logic: Auto-complete rounds in UNDER_REVIEW with no pending reports
      const roundsToCheck = allRounds.filter(r =>
        (r.status === RoundStatus.ACTIVE || r.status === RoundStatus.UNDER_REVIEW) &&
        myGroups.some(g =>
          String(g.id).toLowerCase().trim() ===
          String(r.groupId).toLowerCase().trim()
        )
      );

      for (const round of roundsToCheck) {
        const roundIdLower = String(round.id).toLowerCase().trim();

        const studentReports = allReports.filter(rep => {
          const repRoundId = Array.isArray(rep.roundId) ? rep.roundId[0] : rep.roundId;
          return String(repRoundId).toLowerCase().trim() === roundIdLower &&
            rep.type === 'STUDENT';
        });

        const pendingReports = studentReports.filter(rep => !rep.isApproved);



        // Se existem relatórios mas ainda está ACTIVE → mover para UNDER_REVIEW
        if (round.status === RoundStatus.ACTIVE && studentReports.length > 0) {
          await Store.updateRoundStatus(round.id, RoundStatus.UNDER_REVIEW);
          round.status = RoundStatus.UNDER_REVIEW;
        }

        // Se não há pendentes → completar
        if (pendingReports.length === 0 && studentReports.length > 0) {
          await Store.completeRound(round.id);
          round.status = RoundStatus.COMPLETED;
        }
      }

      setUsers(allUsers);
      setGroups(myGroups);
      setActiveRounds(allRounds.filter(r => myGroups.some(g => String(g.id).toLowerCase().trim() === String(r.groupId).toLowerCase().trim())));
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

      // Update local state and check for completion using the updated list
      const updatedReports = reports.map(r =>
        String(r.id).toLowerCase() === String(reportId).toLowerCase() ? { ...r, isApproved: true } : r
      );
      setReports(updatedReports);

      const pendingsOfRound = updatedReports.filter(r => {
        const rId = Array.isArray(r.roundId) ? r.roundId[0] : r.roundId;
        return String(rId).toLowerCase().trim() === String(roundId).toLowerCase().trim() &&
          r.type === 'STUDENT' &&
          !r.isApproved;
      });

      console.log("🧪 DEBUG PENDINGS", {
        roundId,
        totalReports: updatedReports.length,
        pendingsOfRound
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
  const myPendingTasks = assignments.filter(a => a.giverId === me?.id && a.status === 'PENDING' && a.isFromMonitor);
  const reportsForApproval = reports.filter(r => r.type === 'STUDENT' && !r.isApproved);
  const hasActiveCollectingRound = activeRounds.some(r => r.status === RoundStatus.ACTIVE);
  const showTasksFirst = hasActiveCollectingRound && myPendingTasks.length > 0;

  const myMonitorReports = reports
    .filter(r => r.targetId === me?.id && r.type === 'MONITOR')
    .sort((a, b) => b.createdAt - a.createdAt);

  const getReportTitle = (report: SynthesizedReport) => {
    const rId = Array.isArray(report.roundId) ? report.roundId[0] : report.roundId;
    const round = activeRounds.find(rd => rd.id === rId);
    if (!round) return "Feedback Recebido";
    const group = groups.find(g => g.id === round.groupId);
    return `${group?.name || 'Turma'} - ${round.name}`;
  };

  const getStudentsWithPendingTasks = (round: FeedbackRound) => {
    const roundIdLower = String(round.id).toLowerCase().trim();
    const groupStudents = users.filter(u => String(u.groupId).toLowerCase().trim() === String(round.groupId).toLowerCase().trim() && u.role === Role.STUDENT);
    const roundAssignments = assignments.filter(a => String(a.roundId).toLowerCase().trim() === roundIdLower);
    const roundEvals = courseEvaluations.filter(e => {
      const evalRoundId = Array.isArray(e.roundId) ? e.roundId[0] : e.roundId;
      return String(evalRoundId).toLowerCase().trim() === roundIdLower;
    });
    const group = groups.find(g => String(g.id).toLowerCase().trim() === String(round.groupId).toLowerCase().trim());
    const hasMonitorsInGroup = group && group.monitorIds && group.monitorIds.length > 0;

    return groupStudents.map(student => {
      const studentIdLower = String(student.id).toLowerCase().trim();

      const peerPendingCount = roundAssignments.filter(a =>
        String(a.giverId).toLowerCase().trim() === studentIdLower &&
        !a.isToMonitor &&
        a.status === 'PENDING'
      ).length;

      const hasMonitorFeedback = roundAssignments.some(a =>
        String(a.giverId).toLowerCase().trim() === studentIdLower &&
        a.isToMonitor &&
        a.status === 'SUBMITTED'
      );

      const hasCourseEval = roundEvals.some(e => String(e.studentId).toLowerCase().trim() === studentIdLower);

      const missingMonitor = hasMonitorsInGroup && !hasMonitorFeedback;
      const missingCourse = !hasCourseEval;

      return {
        student,
        peerPendingCount,
        missingMonitor,
        missingCourse,
        isFullyPending: peerPendingCount > 0 || missingMonitor || missingCourse
      };
    }).filter(s => s.isFullyPending);
  };

  return (
    <div className="monitor-page">
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

      <div className="monitor-header">
        <div className="monitor-header__titles">
          <h1 className="monitor-header__title">Mentoria</h1>
          <p className="monitor-header__subtitle">
            Acompanhe o progresso das turmas e revise os relatórios.
          </p>
        </div>

        <div className="monitor-header__actions">
          <button
            onClick={() => setShowMyFeedbacks(!showMyFeedbacks)}
            className={`btn-toggle ${showMyFeedbacks ? 'btn-toggle--active' : ''}`}
          >
            <Star className="icon-sm" />
            {showMyFeedbacks ? 'Ver Painel de Mentoria' : 'Meus Feedbacks'}
          </button>

          <button onClick={refreshData} className="monitor-header__refresh">
            <RefreshCw className="monitor-header__refresh-icon" />
            Sincronizar Dados
          </button>
        </div>
      </div>

      {showMyFeedbacks ? (
        <div className="feedback-section animate-slide-down">
          <div className="feedback-container">
            <h2 className="feedback-section__title">
              <Star className="icon-md text-amber" />
              Meus Feedbacks Consolidados
            </h2>

            <div className="feedback-grid">
              {myMonitorReports.map(report => (
                <div key={report.id} className="feedback-card group">
                  <div className="feedback-card__body">
                    <div className="feedback-card__header">
                      <div className="feedback-card__icon-wrapper">
                        <Sparkles className="icon-md" />
                      </div>
                      <span className="feedback-card__date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="feedback-card__content">
                      <h3 className="feedback-card__title">
                        {getReportTitle(report)}
                      </h3>
                      <p className="feedback-card__text">
                        {report.content}
                      </p>
                    </div>
                  </div>

                  <div className="feedback-card__footer">
                    <Link
                      to={`/monitor-report/${report.id}`}
                      className="btn-view-report"
                    >
                      Ver Relatório Completo
                    </Link>
                  </div>
                </div>
              ))}

              {myMonitorReports.length === 0 && (
                <div className="feedback-empty">
                  <div className="feedback-empty__icon-container">
                    <Star className="icon-lg" />
                  </div>
                  <div className="feedback-empty__texts">
                    <p className="feedback-empty__title">Nenhum feedback consolidado ainda.</p>
                    <p className="feedback-empty__subtitle">
                      Os feedbacks aparecem aqui após os alunos preencherem a avaliação da mentoria e a IA realizar a síntese.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (

        <div className="monitor-grid">
          <div className="monitor-grid__left">
            <div className="monitor-section">
              <h2 className="monitor-section__title">
                <Clock className="monitor-section__title-icon monitor-section__title-icon--violet" /> Atividades das Turmas
              </h2>
              {groups.map(group => {
                const groupRounds = activeRounds.filter(r => r.groupId === group.id);
                const hasOpenSprint = groupRounds.some(r => r.status === RoundStatus.ACTIVE || r.status === RoundStatus.UNDER_REVIEW);
                return (
                  <div key={group.id} className="monitor-card">
                    <div className="monitor-card__header">
                      <h3 className="monitor-card__group-name">{group.name}</h3>
                      <button
                        onClick={() => setConfigGroupId(configGroupId === group.id ? null : group.id)}
                        className={`monitor-card__toggle-btn ${configGroupId === group.id ? 'monitor-card__toggle-btn--active' : ''}`}
                      >
                        {configGroupId === group.id ? <X /> : <Plus />}
                      </button>
                    </div>

                    {configGroupId === group.id && (
                      <div className="monitor-form">
                        <div className="monitor-form__header">
                          <p className="monitor-form__subtitle">Lançar Nova Sprint</p>
                          {hasOpenSprint && (
                            <span className="monitor-form__alert">
                              <AlertCircle className="monitor-form__alert-icon" /> Turma já possui sprint ativa
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Ex: Sprint 01 - Onboarding"
                          className="monitor-form__input"
                          value={newRoundName}
                          onChange={(e) => setNewRoundName(e.target.value)}
                          disabled={hasOpenSprint}
                        />
                        <div className="monitor-form__field">
                          <label className="monitor-form__label">Data de Encerramento</label>
                          <input
                            type="date"
                            className="monitor-form__input"
                            value={newRoundDeadline}
                            onChange={(e) => setNewRoundDeadline(e.target.value)}
                            disabled={hasOpenSprint}
                          />
                        </div>
                        <button
                          onClick={() => handleStartRound(group.id)}
                          disabled={hasOpenSprint}
                          className="monitor-form__submit"
                        >
                          {hasOpenSprint ? 'Finalize a sprint anterior primeiro' : 'Lançar para Alunos'}
                        </button>
                      </div>
                    )}

                    <div className="monitor-rounds-list">
                      {groupRounds.map(round => {
                        const roundIdLower = String(round.id).toLowerCase().trim();
                        const roundAssignments = assignments.filter(a => String(a.roundId).toLowerCase().trim() === roundIdLower && !a.isToMonitor);
                        const submittedAssignmentsCount = roundAssignments.filter(s => s.status === 'SUBMITTED').length;

                        const roundEvals = courseEvaluations.filter(e => String(e.roundId).toLowerCase().trim() === roundIdLower);
                        const groupStudents = users.filter(u => String(u.groupId).toLowerCase().trim() === String(round.groupId).toLowerCase().trim() && u.role === Role.STUDENT);

                        const totalTasks = roundAssignments.length + groupStudents.length;
                        const totalSubmitted = submittedAssignmentsCount + roundEvals.length;

                        const isReview = round.status === RoundStatus.UNDER_REVIEW;
                        const isCompleted = round.status === RoundStatus.COMPLETED;
                        const isActive = round.status === RoundStatus.ACTIVE;

                        return (
                          <div key={round.id} className={`monitor-round-card ${isCompleted ? 'monitor-round-card--completed' : isReview ? 'monitor-round-card--review' : 'monitor-round-card--active'}`}>
                            <div className="monitor-round-card__main">
                              <div className="monitor-round-card__info">
                                <div className="monitor-round-card__title-row">
                                  <span className="monitor-round-card__name">{round.name}</span>
                                  {!isCompleted && (
                                    <button
                                      onClick={() => setDeletingRoundId(round.id)}
                                      className="monitor-round-card__delete"
                                      title="Excluir Sprint"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                                <span className="monitor-round-card__meta">{totalSubmitted} de {totalTasks} entregas realizadas</span>
                              </div>
                              <span className={`monitor-status-badge ${isCompleted ? 'monitor-status-badge--completed' : isReview ? 'monitor-status-badge--review' : 'monitor-status-badge--active'}`}>
                                {isCompleted ? <CheckCircle size={14} /> : <Clock size={14} />}
                                {isCompleted ? 'Finalizada' : isReview ? 'Em Revisão' : 'Coletando'}
                              </span>
                            </div>

                            {isActive && (
                              <div className="monitor-round-card__footer">
                                <button
                                  onClick={() => handleGenerateAllReports(round.id)}
                                  disabled={batchProcessing === round.id || totalSubmitted === 0}
                                  className="monitor-round-card__action-btn"
                                >
                                  {batchProcessing === round.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Consolidar IA
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {groupRounds.length === 0 && <div className="monitor-empty-state">Aguardando lançamento de sprints.</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="monitor-section">
              <h2 className="monitor-section__title">
                <UserCheck className="monitor-section__title-icon monitor-section__title-icon--rose" /> Cobrança de Preenchimento
              </h2>
              <div className="monitor-collection-card">
                <div className="monitor-collection-card__header">
                  <p className="monitor-collection-card__subtitle">Alunos com tarefas pendentes nas sprints ativas.</p>
                </div>
                <div className="monitor-collection-list">
                  {activeRounds.filter(r => r.status === RoundStatus.ACTIVE).map(round => {
                    const pendings = getStudentsWithPendingTasks(round);
                    if (pendings.length === 0) return null;

                    return (
                      <div key={round.id} className="monitor-collection-group">
                        <div className="monitor-collection-group__header">
                          <span className="monitor-collection-group__label">Sprint:</span>
                          <span className="monitor-collection-group__name">{round.name}</span>
                        </div>
                        <div className="monitor-collection-grid">
                          {pendings.map(({ student, peerPendingCount, missingMonitor, missingCourse }) => (
                            <div key={student.id} className="monitor-student-pending-card">
                              <div className="monitor-student-pending-card__info">
                                <div className="monitor-student-avatar">
                                  {student.photoUrl ? <img src={student.photoUrl} className="monitor-student-avatar__img" /> : <UserIcon size={20} />}
                                </div>
                                <div className="monitor-student-pending-card__details">
                                  <div className="monitor-student-pending-card__name">{student.name}</div>
                                  <div className="monitor-student-pending-card__tags">
                                    {peerPendingCount > 0 && <span className="monitor-tag monitor-tag--rose">{peerPendingCount} Pares</span>}
                                    {missingMonitor && <span className="monitor-tag monitor-tag--violet">Mentoria</span>}
                                    {missingCourse && <span className="monitor-tag monitor-tag--amber">Curso</span>}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => showToast(`Cobrança enviada para ${student.name.split(' ')[0]}!`)}
                                className="monitor-student-pending-card__send-btn"
                                disabled={!peerPendingCount && !missingMonitor && !missingCourse}
                                title={(!peerPendingCount && !missingMonitor && !missingCourse) ? "Tudo em dia" : "Enviar cobrança"}
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {activeRounds.filter(r => r.status === RoundStatus.ACTIVE).every(r => getStudentsWithPendingTasks(r).length === 0) && (
                    <div className="monitor-all-clear">
                      <div className="monitor-all-clear__icon-wrapper">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="monitor-all-clear__text">Todos os alunos estão em dia!</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="monitor-grid__right">
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
      )}
    </div>
  );
};

export default MonitorPanel;
