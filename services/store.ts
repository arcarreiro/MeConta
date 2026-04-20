
import { supabase } from './supabase';
import { User, Group, FeedbackRound, FeedbackAssignment, SynthesizedReport, Role, CourseEvaluation, RoundStatus } from '../types';

export class Store {
  private static currentUser: User | null = null;

  static async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        this.currentUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          groupId: profile.group_id,
          bio: profile.bio,
          curricularInfo: profile.curricular_info,
          resumeUrl: profile.resume_url,
          photoUrl: profile.photo_url
        } as any;
      }
    }
  }

  static getCurrentUser() {
    return this.currentUser;
  }

  static async login(email: string, pass: string): Promise<{ user: User | null, error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: "Erro ao autenticar." };

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) return { user: null, error: "Perfil não encontrado." };

      this.currentUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        groupId: profile.group_id,
        bio: profile.bio,
        curricularInfo: profile.curricular_info,
        resumeUrl: profile.resume_url,
        photoUrl: profile.photo_url
      };
      return { user: this.currentUser };
    } catch (e) {
      return { user: null, error: "Erro inesperado." };
    }
  }

  static async logout() {
    await supabase.auth.signOut();
    this.currentUser = null;
  }

  static async register(u: { name: string, email: string, password: string }): Promise<{ success: boolean, error?: string }> {
    const { data, error } = await supabase.auth.signUp({ email: u.email, password: u.password });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: "Erro ao criar credenciais." };

    let assignedRole = Role.STUDENT;
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (count === 0) assignedRole = Role.ADMIN;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name: u.name,
      email: u.email,
      role: assignedRole
    });

    if (profileError) return { success: false, error: profileError.message };
    return { success: true };
  }

  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as Role,
      groupId: u.group_id,
      bio: u.bio,
      curricularInfo: u.curricular_info,
      resumeUrl: u.resume_url,
      photoUrl: u.photo_url
    } as any));
  }

  static async getGroups(): Promise<Group[]> {
    const { data } = await supabase.from('groups').select('*');
    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      monitorIds: g.monitor_ids || []
    }));
  }

  static async getRounds(): Promise<FeedbackRound[]> {
    const { data } = await supabase.from('rounds').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      deadline: r.deadline,
      groupId: r.group_id,
      status: r.status as RoundStatus,
      createdAt: new Date(r.created_at).getTime()
    }));
  }

  static async getAssignments(): Promise<FeedbackAssignment[]> {
    const { data } = await supabase.from('assignments').select('*');
    return (data || []).map(a => ({
      id: a.id,
      roundId: a.round_id,
      giverId: a.giver_id,
      receiverId: a.receiver_id,
      content: a.content,
      status: a.status as any,
      isFromMonitor: a.is_from_monitor,
      isToMonitor: a.is_to_monitor
    }));
  }

  static async getReports(): Promise<SynthesizedReport[]> {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    return (data || []).map(r => ({
      id: r.id,
      targetId: r.target_id,
      roundId: r.round_id,
      content: r.content,
      evolution: r.evolution,
      createdAt: new Date(r.created_at).getTime(),
      type: r.type as any,
      isApproved: r.is_approved
    }));
  }

  static async getCourseEvaluations(): Promise<CourseEvaluation[]> {
    const { data } = await supabase.from('course_evaluations').select('*');
    return (data || []).map(e => ({
      id: e.id,
      roundId: String(e.round_id),
      studentId: String(e.student_id),
      q1: { score: e.q1_score, comment: e.q1_comment },
      q2: { score: e.q2_score, comment: e.q2_comment },
      q3: { score: e.q3_score || 0, comment: e.q3_comment }
    }));
  }

  static async updateUser(u: Partial<User>) {
    await supabase.from('profiles').update({
      name: u.name,
      bio: u.bio,
      curricular_info: u.curricularInfo,
      resume_url: u.resumeUrl,
      photo_url: u.photoUrl,
      group_id: u.groupId
    }).eq('id', u.id);
  }

  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  static async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  static async updateUserRole(userId: string, role: Role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  }

  static async createGroup(name: string, monitorIds: string[] = []) {
    const { data, error } = await supabase.from('groups').insert({ name, monitor_ids: monitorIds }).select().single();
    if (error) throw error;
    return data;
  }

  
  static async deleteGroup(groupId: string) {
    // 1. Desvincular alunos da turma (set group_id to null)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ group_id: null })
      .eq('group_id', groupId);
    
    if (updateError) throw updateError;

    // 2. Excluir a turma
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (deleteError) throw deleteError;
  }

  static async updateGroupMonitors(groupId: string, monitorIds: string[]) {
    await supabase.from('groups').update({ monitor_ids: monitorIds }).eq('id', groupId);
  }

  static async assignToGroup(userId: string, groupId: string) {
    await supabase.from('profiles').update({ group_id: groupId }).eq('id', userId);
  }

  static async startRound(groupId: string, name: string, deadline: number) {
    // 1. Criar a rodada
    const { data: round, error } = await supabase.from('rounds').insert({ 
      group_id: groupId, 
      name, 
      deadline, 
      status: RoundStatus.ACTIVE 
    }).select().single();
    if (error) throw error;

    // 2. Obter alunos e monitores da turma
    const { data: students } = await supabase.from('profiles').select('id').eq('group_id', groupId).eq('role', Role.STUDENT);
    const { data: group } = await supabase.from('groups').select('monitor_ids').eq('id', groupId).single();
    
    if (!students || students.length === 0) return round;

    const studentIds = students.map(s => s.id);
    const monitorIds = group?.monitor_ids || [];
    const assignmentsToInsert: any[] = [];

    // --- PARTE A: MONITORES PARA ALUNOS ---
    // Cada monitor avalia cada aluno (Monitor -> Student)
    students.forEach((student: any) => {
      monitorIds.forEach((mId: string) => {
        assignmentsToInsert.push({ 
          round_id: round.id, 
          giver_id: mId, 
          receiver_id: student.id, 
          is_from_monitor: true, 
          is_to_monitor: false, 
          status: 'PENDING' 
        });
      });
    });

    // --- PARTE B: ALUNOS PARA ALUNOS (BALANÇADO + HISTÓRICO) ---
    // Cada aluno dá 2 e RECEBE exatamente 2 (Student -> Student)
    
    // Buscar histórico de pares para tentar não repetir
    const { data: pastAssignments } = await supabase
      .from('assignments')
      .select('giver_id, receiver_id')
      .in('giver_id', studentIds)
      .in('receiver_id', studentIds)
      .eq('is_from_monitor', false)
      .eq('is_to_monitor', false);
    
    const pastPairsSet = new Set(pastAssignments?.map(a => `${a.giver_id}-${a.receiver_id}`));

    const n = students.length;
    const numFeedbacksPerStudent = Math.min(2, n - 1);
    
    let bestPeerAssignments: any[] = [];
    let minHistoryScore = Infinity;

    // Tentar 50 combinações diferentes para minimizar repetições históricas
    for (let attempt = 0; attempt < 50; attempt++) {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const currentAttempt: any[] = [];
      let currentHistoryScore = 0;

      for (let i = 0; i < n; i++) {
        const giver = shuffled[i];
        for (let j = 1; j <= numFeedbacksPerStudent; j++) {
          const receiver = shuffled[(i + j) % n];
          const pairKey = `${giver.id}-${receiver.id}`;
          
          if (pastPairsSet.has(pairKey)) {
            currentHistoryScore++;
          }

          currentAttempt.push({
            round_id: round.id,
            giver_id: giver.id,
            receiver_id: receiver.id,
            is_from_monitor: false,
            is_to_monitor: false,
            status: 'PENDING'
          });
        }
      }

      if (currentHistoryScore < minHistoryScore) {
        minHistoryScore = currentHistoryScore;
        bestPeerAssignments = currentAttempt;
        if (minHistoryScore === 0) break; // Combinação perfeita encontrada
      }
    }

    // Unificar e inserir no banco
    const allAssignments = [...assignmentsToInsert, ...bestPeerAssignments];
    if (allAssignments.length > 0) {
      await supabase.from('assignments').insert(allAssignments);
    }

    return round;
  }

  static async deleteRound(roundId: string) {
    await supabase.from('rounds').delete().eq('id', roundId);
  }

  static async submitFeedback(assignmentId: string, content: string) {
    await supabase.from('assignments').update({ content, status: 'SUBMITTED' }).eq('id', assignmentId);
  }

  static async submitCourseEvaluation(ev: CourseEvaluation) {
    await supabase.from('course_evaluations').upsert({
      round_id: ev.roundId,
      student_id: ev.studentId,
      q1_score: ev.q1.score,
      q1_comment: ev.q1.comment,
      q2_score: ev.q2.score,
      q2_comment: ev.q2.comment,
      q3_score: ev.q3.score,
      q3_comment: ev.q3.comment
    });
  }

  static async createStudentToMonitorFeedback(roundId: string, studentId: string, monitorId: string, content: string) {
    await supabase.from('assignments').insert({
      round_id: roundId, giver_id: studentId, receiver_id: monitorId, content, status: 'SUBMITTED', is_to_monitor: true, is_from_monitor: false
    });
  }

  static async addReport(report: Partial<SynthesizedReport>): Promise<SynthesizedReport> {
    const { data, error } = await supabase.from('reports').insert({
      target_id: report.targetId,
      round_id: report.roundId,
      content: report.content,
      evolution: report.evolution,
      type: report.type,
      is_approved: report.isApproved ?? false
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      targetId: data.target_id,
      roundId: data.round_id,
      content: data.content,
      evolution: data.evolution,
      createdAt: new Date(data.created_at).getTime(),
      type: data.type,
      isApproved: data.is_approved
    };
  }

  static async updateReport(id: string, updates: Partial<SynthesizedReport>) {
    await supabase.from('reports').update({ content: updates.content, evolution: updates.evolution }).eq('id', id);
  }

  /**
   * Aprova o relatório e verifica se a operação foi bem sucedida no banco.
   * Se não houver erro mas o banco não retornar a linha afetada, lança exceção (provável RLS).
   */
  static async approveReport(id: string) {
    const { data, error } = await supabase
      .from('reports')
      .update({ is_approved: true })
      .eq('id', id)
      .select(); // Força o retorno dos dados afetados
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Falha na atualização: Verifique se você tem permissão de escrita (RLS) nesta tabela.");
    }
  }

  static async updateRoundStatus(roundId: string, status: RoundStatus) {
    await supabase.from('rounds').update({ status }).eq('id', roundId);
  }

  static async completeRound(roundId: string) {
    await this.updateRoundStatus(roundId, RoundStatus.COMPLETED);
  }
}
