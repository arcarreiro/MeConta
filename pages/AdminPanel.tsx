
import React, { useState, useEffect } from 'react';
import { Store } from '../services/store';
import { Role, User, Group, FeedbackRound, CourseEvaluation, SynthesizedReport } from '../types';
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
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { synthesizeTrajectory, synthesizeCourseAnalysis } from '../services/gemini';
import { useNavigate, Link } from 'react-router-dom';


const DeleteGroupModal: React.FC<{ isOpen: boolean; groupName: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({ isOpen, groupName, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-200 text-center border border-slate-100">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Excluir Turma?<br /><span className="text-rose-600 text-lg">"{groupName}"</span></h3>
          <p className="text-slate-500 font-medium mt-4 leading-relaxed">
            Esta ação removerá o registro da turma. Os alunos vinculados ficarão <strong>não alocados</strong>, mas seus relatórios e históricos individuais <strong>serão preservados</strong>.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95">Manter Turma</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
      setActionError("Erro de carregamento: " + err.message);
    }
  };

  const handleGenerateCourseReport = async (roundId: string) => {
    setIsGenerating(roundId);
    setActionError(null);
    try {
      const fetchedEvals = await Store.getCourseEvaluations();
      const currentEvals = fetchedEvals.filter(e => String(e.roundId) === String(roundId));

      if (currentEvals.length === 0) {
        alert(`Não encontramos avaliações salvas para esta rodada.`);
        setIsGenerating(null);
        return;
      }

      const round = rounds.find(r => r.id === roundId);
      if (!round) throw new Error("Rodada não identificada.");

      const allComments = currentEvals.flatMap(e => [e.q1.comment, e.q2.comment, e.q3.comment]).filter(c => !!c && c.trim().length > 3);

      if (allComments.length === 0) {
        alert("Nenhum comentário em texto foi feito para análise.");
        setIsGenerating(null);
        return;
      }

      const result = await synthesizeCourseAnalysis(round.name, allComments);
      const savedReport = await Store.addReport({
        targetId: me?.id || roundId,
        roundId: roundId,
        content: result.analysis_summary,
        evolution: "",
        type: 'COURSE',
        isApproved: true
      });

      setReports(prev => [savedReport, ...prev]);
      navigate(`/course-report/${savedReport.id}`);
    } catch (err: any) {
      setActionError("Falha na geração: " + (err.message || "Erro de conexão."));
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
      setActionError("Erro ao criar turma: " + err.message);
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
      setActionError("Erro ao excluir turma: " + err.message);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const toggleMonitorInGroup = async (groupId: string, monitorId: string) => {
    setActionError(null);
    try {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      let updatedMonitorIds = group.monitorIds.includes(monitorId)
        ? group.monitorIds.filter(id => id !== monitorId)
        : [...group.monitorIds, monitorId];
      await Store.updateGroupMonitors(groupId, updatedMonitorIds);
      await refresh();
    } catch (err: any) {
      setActionError("Erro ao atualizar monitores: " + err.message);
    }
  };

  const toggleRoundSelection = (roundId: string) => {
    setSelectedRoundIds(prev =>
      prev.includes(roundId) ? prev.filter(id => id !== roundId) : [...prev, roundId]
    );
  };

  const handleGenerateTrajectory = async (student: User) => {
    if (selectedRoundIds.length < 2) {
      alert("Selecione pelo menos 2 sprints.");
      return;
    }
    setIsGenerating(student.id);
    setActionError(null);
    try {
      const historicalReports = reports
        .filter(r => r.targetId === student.id && selectedRoundIds.includes(Array.isArray(r.roundId) ? r.roundId[0] : r.roundId))
        .map(r => r.content);

      if (historicalReports.length === 0) {
        alert("Não existem relatórios individuais aprovados para estas sprints.");
        setIsGenerating(null);
        return;
      }

      const result = await synthesizeTrajectory(student.name, historicalReports);
      const savedReport = await Store.addReport({
        targetId: student.id,
        roundId: selectedRoundIds,
        content: result.trajectory_summary,
        evolution: "",
        type: 'TRAJECTORY',
        isApproved: true
      });

      setReports(prev => [savedReport, ...prev]);
      navigate(`/trajectory-report/${savedReport.id}`);
    } catch (err: any) {
      setActionError("Erro na trajetória: " + err.message);
    } finally {
      setIsGenerating(null);
    }
  };

  const monitors = users.filter(u => u.role === Role.MONITOR);
  const studentsInSelectedGroup = users.filter(u => u.groupId === selectedGroupId && u.role === Role.STUDENT);
  const roundsInSelectedGroup = rounds.filter(r => r.groupId === selectedGroupId);

  const groupBeingDeleted = groups.find(g => g.id === deletingGroupId);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <DeleteGroupModal
        isOpen={!!deletingGroupId}
        groupName={groupBeingDeleted?.name || ''}
        loading={isDeletingGroup}
        onConfirm={handleDeleteGroup}
        onCancel={() => setDeletingGroupId(null)}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Gestão</h1>
          <p className="text-slate-500 font-medium">Controle de turmas, monitores e inteligência pedagógica.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="bg-white border border-slate-200 text-slate-500 p-4 rounded-2xl hover:text-violet-600 hover:border-violet-100 transition-all flex items-center gap-2 font-bold shadow-soft">
            <RefreshCw className="w-5 h-5" /> Sincronizar
          </button>
          <Link to="/admin/users" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-violet-600 transition-all shadow-soft">
            <Users className="w-5 h-5" /> Membros
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl flex items-center gap-3 border border-rose-100 font-bold">
          <AlertCircle className="w-5 h-5" />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {viewingGroupStudents && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[85vh] flex flex-col border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{viewingGroupStudents.name}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Alunos da Turma</p>
              </div>
              <button onClick={() => setViewingGroupStudents(null)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-soft border border-slate-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {users.filter(u => u.groupId === viewingGroupStudents.id && u.role === Role.STUDENT).map(student => (
                <div key={student.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:border-violet-200 transition-all group">
                  <div className="flex items-center gap-4">
                    {student.photoUrl ? (
                      <img src={student.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300"><Users className="w-6 h-6" /></div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.email}</div>
                    </div>
                  </div>
                  <Link to={`/admin/student/${student.id}`} className="bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-violet-600 hover:text-white transition-all shadow-sm">
                    Ver Ficha <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
              {users.filter(u => u.groupId === viewingGroupStudents.id && u.role === Role.STUDENT).length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold italic">Nenhum aluno alocado nesta turma.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-10 space-y-8">
          <h2 className="font-black text-slate-900 text-xl flex items-center gap-3"><Plus className="w-6 h-6 text-violet-600" /> Nova Turma</h2>
          <form onSubmit={handleCreateGroup} className="flex gap-4">
            <input type="text" placeholder="Nome da turma (ex: Turma 01 - 2024)" className="flex-1 bg-slate-50 border-2 border-transparent focus:border-violet-100 focus:bg-white rounded-2xl px-6 py-4 focus:ring-0 font-bold text-sm transition-all" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} disabled={isCreatingGroup} />
            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 rounded-2xl transition-all shadow-brand disabled:opacity-50" disabled={isCreatingGroup || !newGroupName}>
              {isCreatingGroup ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar'}
            </button>
          </form>

          <div className="pt-4 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Turmas Ativas</h3>
            <div className="grid gap-3">
              {groups.map(g => (
                <div key={g.id} className="p-6 bg-slate-50 rounded-3xl space-y-6 border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setViewingGroupStudents(g)} className="font-black text-slate-900 hover:text-violet-600 transition-colors flex items-center gap-3 group text-xl tracking-tight">
                        {g.name} <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => setDeletingGroupId(g.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir Turma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm">{users.filter(u => u.groupId === g.id && u.role === Role.STUDENT).length} Alunos</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsáveis (Monitores)</p>
                    <div className="flex flex-wrap gap-2">
                      {monitors.map(m => (
                        <button key={m.id} onClick={() => toggleMonitorInGroup(g.id, m.id)} className={`text-[10px] font-bold px-4 py-2 rounded-xl border transition-all ${g.monitorIds.includes(m.id) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-violet-200'}`}>{m.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-violet-600 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center space-y-6 text-white shadow-brand">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users className="w-12 h-12" />
          </div>
          <div>
            <div className="text-6xl font-black">{users.length}</div>
            <div className="text-sm font-black uppercase tracking-[0.2em] opacity-60">Pessoas na Plataforma</div>
          </div>
          <Link to="/admin/users" className="bg-white text-violet-600 px-10 py-4 rounded-2xl font-black hover:bg-violet-50 transition-all shadow-xl active:scale-95">Ver Todos os Membros</Link>
        </section>
      </div>

      <section className="bg-white rounded-[3rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-100"><BarChart3 className="w-8 h-8" /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Diagnóstico Pedagógico</h2>
              <p className="text-slate-500 font-medium">Análise de sentimentos e NPS das rodadas.</p>
            </div>
          </div>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rounds.map(round => {
            const evalCount = evaluations.filter(e => String(e.roundId) === String(round.id)).length;
            const existingReport = reports.find(r => r.type === 'COURSE' && (Array.isArray(r.roundId) ? r.roundId.includes(round.id) : r.roundId === round.id));
            return (
              <div key={round.id} className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all group">
                <div>
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">{groups.find(g => g.id === round.groupId)?.name || 'Turma Excluída'}</div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{round.name}</h3>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (evalCount / 10) * 100)}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-slate-400">{evalCount} evals</span>
                  </div>
                </div>
                <button onClick={() => existingReport ? navigate(`/course-report/${existingReport.id}`) : handleGenerateCourseReport(round.id)} disabled={isGenerating === round.id || (!existingReport && evalCount === 0)} className={`mt-8 w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all ${existingReport ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-900 text-white hover:bg-violet-600 disabled:opacity-20'}`}>
                  {isGenerating === round.id ? <Loader2 className="w-5 h-5 animate-spin" /> : existingReport ? <FileText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  {existingReport ? 'Ver Relatório' : 'Gerar Análise'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-[3rem] border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-10 bg-violet-50/30 border-b border-violet-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-violet-100"><TrendingUp className="w-8 h-8" /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Evolução de Talentos</h2>
            <p className="text-slate-500 font-medium">Consolidado longitudinal de comportamento e performance.</p>
          </div>
        </div>
        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Escolher Turma</label>
            <div className="grid gap-3">
              {groups.map(g => (
                <button key={g.id} onClick={() => { setSelectedGroupId(g.id); setSelectedRoundIds([]); }} className={`p-5 rounded-2xl border-2 text-left transition-all font-bold ${selectedGroupId === g.id ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-md shadow-violet-100' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{g.name}</button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Sprints para Análise</label>
            {selectedGroupId ? (
              <div className="grid gap-2">
                {roundsInSelectedGroup.map(r => (
                  <button key={r.id} onClick={() => toggleRoundSelection(r.id)} className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-sm font-bold ${selectedRoundIds.includes(r.id) ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {selectedRoundIds.includes(r.id) ? <CheckSquare className="w-6 h-6 text-violet-600 shrink-0" /> : <Square className="w-6 h-6 text-slate-200 shrink-0" />}
                    {r.name}
                  </button>
                ))}
              </div>
            ) : <div className="text-slate-300 text-sm py-12 text-center font-medium italic">Selecione uma turma primeiro...</div>}
          </div>
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">3. Gerar por Talento</label>
            <div className="divide-y divide-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden max-h-[400px] overflow-y-auto bg-white shadow-inner">
              {studentsInSelectedGroup.map(student => {
                const existingTrajectory = reports.find(r => r.type === 'TRAJECTORY' && r.targetId === student.id);
                return (
                  <div key={student.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-bold text-slate-700 truncate mr-4">{student.name}</span>
                    <button disabled={isGenerating !== null || selectedRoundIds.length < 2} onClick={() => existingTrajectory ? navigate(`/trajectory-report/${existingTrajectory.id}`) : handleGenerateTrajectory(student)} className={`p-3 rounded-xl transition-all ${isGenerating === student.id ? 'bg-slate-100' : existingTrajectory ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white' : 'bg-slate-900 text-white hover:bg-violet-600 disabled:opacity-10'}`}>
                      {isGenerating === student.id ? <Loader2 className="w-5 h-5 animate-spin" /> : existingTrajectory ? <FileText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
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
