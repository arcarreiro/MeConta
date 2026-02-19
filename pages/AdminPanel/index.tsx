import React, { useState, useEffect } from 'react';
import { Store } from '../../services/store';
import { Role, User, Group, FeedbackRound, CourseEvaluation, SynthesizedReport } from '../../types';
import {
  Users,
  Plus,
  TrendingUp,
  ChevronRight,
  CheckSquare,
  Square,
  Loader2,
  Sparkles,
  BarChart3,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  FileText,
  Trash2
} from 'lucide-react';
import { synthesizeTrajectory, synthesizeCourseAnalysis } from '../../services/gemini';
import { useNavigate, Link } from 'react-router-dom';
import { DeleteGroupModal } from '../../components/modals/DeleteGroupModal';
import './styles.css';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const me = Store.getCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rounds, setRounds] = useState<FeedbackRound[]>([]);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [reports, setReports] = useState<SynthesizedReport[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedRoundIds, setSelectedRoundIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewingGroupStudents, setViewingGroupStudents] = useState<Group | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      const fetchedUsers = await Store.getUsers();
      const fetchedGroups = await Store.getGroups();
      const fetchedRounds = await Store.getRounds();
      const fetchedEvals = await Store.getCourseEvaluations();
      const fetchedReports = await Store.getReports();

      setUsers(fetchedUsers);
      setGroups(fetchedGroups);
      setRounds(fetchedRounds);
      setEvaluations(fetchedEvals);
      setReports(fetchedReports);
    } catch (err: any) {
      setActionError('Erro de carregamento: ' + err.message);
    }
  };

  const handleGenerateCourseReport = async (roundId: string) => {
    setIsGenerating(roundId);
    setActionError(null);
    try {
      const fetchedEvals = await Store.getCourseEvaluations();
      const currentEvals = fetchedEvals.filter((e) => String(e.roundId) === String(roundId));

      if (currentEvals.length === 0) {
        alert('Não encontramos avaliações salvas para esta rodada.');
        setIsGenerating(null);
        return;
      }

      const round = rounds.find((r) => r.id === roundId);
      if (!round) throw new Error('Rodada não identificada.');

      const allComments = currentEvals
        .flatMap((e) => [e.q1.comment, e.q2.comment, e.q3.comment])
        .filter((c) => !!c && c.trim().length > 3);

      if (allComments.length === 0) {
        alert('Nenhum comentário em texto foi feito para análise.');
        setIsGenerating(null);
        return;
      }

      const result = await synthesizeCourseAnalysis(round.name, allComments);
      const savedReport = await Store.addReport({
        targetId: me?.id || roundId,
        roundId: roundId,
        content: result.analysis_summary,
        evolution: '',
        type: 'COURSE',
        isApproved: true,
      });

      setReports((prev) => [savedReport, ...prev]);
      navigate(`/course-report/${savedReport.id}`);
    } catch (err: any) {
      setActionError('Falha na geração: ' + (err.message || 'Erro de conexão.'));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || isCreatingGroup) return;
    setIsCreatingGroup(true);
    setActionError(null);
    try {
      await Store.createGroup(newGroupName);
      setNewGroupName('');
      await refresh();
    } catch (err: any) {
      setActionError('Erro ao criar turma: ' + err.message);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroupId) return;
    setIsDeletingGroup(true);
    try {
      await Store.deleteGroup(deletingGroupId);
      setDeletingGroupId(null);
      await refresh();
    } catch (err: any) {
      setActionError('Erro ao excluir turma: ' + err.message);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const toggleMonitorInGroup = async (groupId: string, monitorId: string) => {
    setActionError(null);
    try {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      const updatedMonitorIds = group.monitorIds.includes(monitorId)
        ? group.monitorIds.filter((id) => id !== monitorId)
        : [...group.monitorIds, monitorId];
      await Store.updateGroupMonitors(groupId, updatedMonitorIds);
      await refresh();
    } catch (err: any) {
      setActionError('Erro ao atualizar monitores: ' + err.message);
    }
  };

  const toggleRoundSelection = (roundId: string) => {
    setSelectedRoundIds((prev) =>
      prev.includes(roundId) ? prev.filter((id) => id !== roundId) : [...prev, roundId],
    );
  };

  const handleGenerateTrajectory = async (student: User) => {
    if (selectedRoundIds.length < 2) {
      alert('Selecione pelo menos 2 sprints.');
      return;
    }
    setIsGenerating(student.id);
    setActionError(null);
    try {
      const historicalReports = reports
        .filter(
          (r) =>
            r.targetId === student.id &&
            selectedRoundIds.includes(Array.isArray(r.roundId) ? r.roundId[0] : r.roundId),
        )
        .map((r) => r.content);

      if (historicalReports.length === 0) {
        alert('Não existem relatórios individuais aprovados para estas sprints.');
        setIsGenerating(null);
        return;
      }

      const result = await synthesizeTrajectory(student.name, historicalReports);
      const savedReport = await Store.addReport({
        targetId: student.id,
        roundId: selectedRoundIds,
        content: result.trajectory_summary,
        evolution: '',
        type: 'TRAJECTORY',
        isApproved: true,
      });

      setReports((prev) => [savedReport, ...prev]);
      navigate(`/trajectory-report/${savedReport.id}`);
    } catch (err: any) {
      setActionError('Erro na trajetória: ' + err.message);
    } finally {
      setIsGenerating(null);
    }
  };

  const monitors = users.filter((u) => u.role === Role.MONITOR);
  const studentsInSelectedGroup = users.filter(
    (u) => u.groupId === selectedGroupId && u.role === Role.STUDENT,
  );
  const roundsInSelectedGroup = rounds.filter((r) => r.groupId === selectedGroupId);

  const groupBeingDeleted = groups.find((g) => g.id === deletingGroupId);

  return (
    <div className="admin-page">
      <DeleteGroupModal
        isOpen={!!deletingGroupId}
        groupName={groupBeingDeleted?.name || ''}
        loading={isDeletingGroup}
        onConfirm={handleDeleteGroup}
        onCancel={() => setDeletingGroupId(null)}
      />

      <div className="admin-header">
        <div className="admin-header__titles">
          <h1 className="admin-header__title">Gestão</h1>
          <p className="admin-header__subtitle">
            Controle de turmas, monitores e inteligência pedagógica.
          </p>
        </div>
        <div className="admin-header__actions">
          <button onClick={refresh} className="admin-header__button admin-header__button--secondary">
            <RefreshCw className="admin-header__button-icon" /> Sincronizar
          </button>
          <Link to="/admin/users" className="admin-header__button admin-header__button--primary">
            <Users className="admin-header__button-icon" /> Membros
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="admin-alert admin-alert--error">
          <AlertCircle className="admin-alert__icon" />
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="admin-alert__close"
          >
            <X className="admin-alert__close-icon" />
          </button>
        </div>
      )}

      {viewingGroupStudents && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <div>
                <h3 className="admin-modal__title">{viewingGroupStudents.name}</h3>
                <p className="admin-modal__subtitle">Alunos da Turma</p>
              </div>
              <button
                onClick={() => setViewingGroupStudents(null)}
                className="admin-modal__close"
              >
                <X className="admin-modal__close-icon" />
              </button>
            </div>
            <div className="admin-modal__body">
              {users
                .filter(
                  (u) => u.groupId === viewingGroupStudents.id && u.role === Role.STUDENT,
                )
                .map((student) => (
                  <div key={student.id} className="admin-student-card">
                    <div className="admin-student-card__info">
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl}
                          className="admin-student-card__avatar"
                        />
                      ) : (
                        <div className="admin-student-card__avatar admin-student-card__avatar--placeholder">
                          <Users className="admin-student-card__avatar-icon" />
                        </div>
                      )}
                      <div>
                        <div className="admin-student-card__name">{student.name}</div>
                        <div className="admin-student-card__email">{student.email}</div>
                      </div>
                    </div>
                    <Link
                      to={`/admin/student/${student.id}`}
                      className="admin-student-card__button"
                    >
                      Ver Ficha <ExternalLink className="admin-student-card__button-icon" />
                    </Link>
                  </div>
                ))}
              {users.filter(
                (u) => u.groupId === viewingGroupStudents.id && u.role === Role.STUDENT,
              ).length === 0 && (
                <div className="admin-modal__empty">
                  Nenhum aluno alocado nesta turma.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="admin-main-grid">
        <section className="admin-card admin-card--groups">
          <h2 className="admin-card__title">
            <Plus className="admin-card__title-icon" /> Nova Turma
          </h2>
          <form onSubmit={handleCreateGroup} className="admin-group-form">
            <input
              type="text"
              placeholder="Nome da turma (ex: Turma 01 - 2024)"
              className="admin-group-form__input"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              disabled={isCreatingGroup}
            />
            <button
              type="submit"
              className="admin-group-form__submit"
              disabled={isCreatingGroup || !newGroupName}
            >
              {isCreatingGroup ? (
                <Loader2 className="admin-group-form__spinner" />
              ) : (
                'Criar'
              )}
            </button>
          </form>

          <div className="admin-groups">
            <h3 className="admin-groups__subtitle">Turmas Ativas</h3>
            <div className="admin-groups__list">
              {groups.map((g) => (
                <div key={g.id} className="admin-group-card">
                  <div className="admin-group-card__header">
                    <div className="admin-group-card__title-wrapper">
                      <button
                        onClick={() => setViewingGroupStudents(g)}
                        className="admin-group-card__title-button"
                      >
                        {g.name}
                        <ChevronRight className="admin-group-card__title-icon" />
                      </button>
                      <button
                        onClick={() => setDeletingGroupId(g.id)}
                        className="admin-group-card__delete"
                        title="Excluir Turma"
                      >
                        <Trash2 className="admin-group-card__delete-icon" />
                      </button>
                    </div>
                    <span className="admin-group-card__badge">
                      {
                        users.filter(
                          (u) => u.groupId === g.id && u.role === Role.STUDENT,
                        ).length
                      }{' '}
                      Alunos
                    </span>
                  </div>
                  <div className="admin-group-card__monitors">
                    <p className="admin-group-card__monitors-label">
                      Responsáveis (Monitores)
                    </p>
                    <div className="admin-group-card__monitors-list">
                      {monitors.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMonitorInGroup(g.id, m.id)}
                          className={
                            g.monitorIds.includes(m.id)
                              ? 'admin-monitor-chip admin-monitor-chip--active'
                              : 'admin-monitor-chip'
                          }
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-card admin-card--summary">
          <div className="admin-summary__icon-wrapper">
            <Users className="admin-summary__icon" />
          </div>
          <div className="admin-summary__content">
            <div className="admin-summary__number">{users.length}</div>
            <div className="admin-summary__label">Pessoas na Plataforma</div>
          </div>
          <Link to="/admin/users" className="admin-summary__button">
            Ver Todos os Membros
          </Link>
        </section>
      </div>

      <section className="admin-card admin-card--diagnostic">
        <div className="admin-diagnostic__header">
          <div className="admin-diagnostic__header-left">
            <div className="admin-diagnostic__icon-wrapper">
              <BarChart3 className="admin-diagnostic__icon" />
            </div>
            <div>
              <h2 className="admin-diagnostic__title">Diagnóstico Pedagógico</h2>
              <p className="admin-diagnostic__subtitle">
                Análise de sentimentos e NPS das rodadas.
              </p>
            </div>
          </div>
        </div>
        <div className="admin-diagnostic__grid">
          {rounds.map((round) => {
            const evalCount = evaluations.filter(
              (e) => String(e.roundId) === String(round.id),
            ).length;
            const existingReport = reports.find(
              (r) =>
                r.type === 'COURSE' &&
                (Array.isArray(r.roundId)
                  ? r.roundId.includes(round.id)
                  : r.roundId === round.id),
            );
            const groupName =
              groups.find((g) => g.id === round.groupId)?.name || 'Turma Excluída';
            const progressWidth = Math.min(100, (evalCount / 10) * 100);

            return (
              <div key={round.id} className="admin-diagnostic-card">
                <div>
                  <div className="admin-diagnostic-card__group">{groupName}</div>
                  <h3 className="admin-diagnostic-card__title">{round.name}</h3>
                  <div className="admin-diagnostic-card__progress">
                    <div className="admin-diagnostic-card__progress-bar">
                      <div
                        className="admin-diagnostic-card__progress-fill"
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                    <span className="admin-diagnostic-card__progress-label">
                      {evalCount} evals
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    existingReport
                      ? navigate(`/course-report/${existingReport.id}`)
                      : handleGenerateCourseReport(round.id)
                  }
                  disabled={isGenerating === round.id || (!existingReport && evalCount === 0)}
                  className={
                    existingReport
                      ? 'admin-diagnostic-card__button admin-diagnostic-card__button--secondary'
                      : 'admin-diagnostic-card__button admin-diagnostic-card__button--primary'
                  }
                >
                  {isGenerating === round.id ? (
                    <Loader2 className="admin-diagnostic-card__button-icon admin-diagnostic-card__button-icon--spinner" />
                  ) : existingReport ? (
                    <FileText className="admin-diagnostic-card__button-icon" />
                  ) : (
                    <Sparkles className="admin-diagnostic-card__button-icon" />
                  )}
                  {existingReport ? 'Ver Relatório' : 'Gerar Análise'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-card admin-card--trajectory">
        <div className="admin-trajectory__header">
          <div className="admin-trajectory__icon-wrapper">
            <TrendingUp className="admin-trajectory__icon" />
          </div>
          <div>
            <h2 className="admin-trajectory__title">Evolução de Talentos</h2>
            <p className="admin-trajectory__subtitle">
              Consolidado longitudinal de comportamento e performance.
            </p>
          </div>
        </div>
        <div className="admin-trajectory__grid">
          <div className="admin-trajectory__column">
            <label className="admin-trajectory__step-label">
              1. Escolher Turma
            </label>
            <div className="admin-trajectory__groups">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupId(g.id);
                    setSelectedRoundIds([]);
                  }}
                  className={
                    selectedGroupId === g.id
                      ? 'admin-trajectory__group admin-trajectory__group--active'
                      : 'admin-trajectory__group'
                  }
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-trajectory__column">
            <label className="admin-trajectory__step-label">
              2. Sprints para Análise
            </label>
            {selectedGroupId ? (
              <div className="admin-trajectory__rounds">
                {roundsInSelectedGroup.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => toggleRoundSelection(r.id)}
                    className={
                      selectedRoundIds.includes(r.id)
                        ? 'admin-trajectory__round admin-trajectory__round--selected'
                        : 'admin-trajectory__round'
                    }
                  >
                    {selectedRoundIds.includes(r.id) ? (
                      <CheckSquare className="admin-trajectory__round-icon admin-trajectory__round-icon--selected" />
                    ) : (
                      <Square className="admin-trajectory__round-icon" />
                    )}
                    {r.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="admin-trajectory__rounds-empty">
                Selecione uma turma primeiro...
              </div>
            )}
          </div>

          <div className="admin-trajectory__column">
            <label className="admin-trajectory__step-label">
              3. Gerar por Talento
            </label>
            <div className="admin-trajectory__students">
              {studentsInSelectedGroup.map((student) => {
                const existingTrajectory = reports.find(
                  (r) => r.type === 'TRAJECTORY' && r.targetId === student.id,
                );
                return (
                  <div
                    key={student.id}
                    className="admin-trajectory__student-row"
                  >
                    <span className="admin-trajectory__student-name">
                      {student.name}
                    </span>
                    <button
                      disabled={isGenerating !== null || selectedRoundIds.length < 2}
                      onClick={() =>
                        existingTrajectory
                          ? navigate(`/trajectory-report/${existingTrajectory.id}`)
                          : handleGenerateTrajectory(student)
                      }
                      className={
                        isGenerating === student.id
                          ? 'admin-trajectory__student-button admin-trajectory__student-button--loading'
                          : existingTrajectory
                          ? 'admin-trajectory__student-button admin-trajectory__student-button--existing'
                          : 'admin-trajectory__student-button admin-trajectory__student-button--primary'
                      }
                    >
                      {isGenerating === student.id ? (
                        <Loader2 className="admin-trajectory__student-button-icon admin-trajectory__student-button-icon--spinner" />
                      ) : existingTrajectory ? (
                        <FileText className="admin-trajectory__student-button-icon" />
                      ) : (
                        <Sparkles className="admin-trajectory__student-button-icon" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;

