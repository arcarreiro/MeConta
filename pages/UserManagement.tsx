
import React, { useState, useEffect } from 'react';
import { Store } from '../services/store';
import { Role, User, Group } from '../types';
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Filter, 
  User as UserIcon, 
  ShieldCheck, 
  GraduationCap, 
  UserMinus,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'unallocated' | string>('all');

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const [fetchedUsers, fetchedGroups] = await Promise.all([
      Store.getUsers(),
      Store.getGroups()
    ]);
    setUsers(fetchedUsers);
    setGroups(fetchedGroups);
    setLoading(false);
  };

  const handlePromote = async (userId: string) => {
    await Store.updateUserRole(userId, Role.MONITOR);
    refresh();
  };

  const handleDemote = async (userId: string) => {
    await Store.updateUserRole(userId, Role.STUDENT);
    refresh();
  };

  const handleAssignGroup = async (userId: string, groupId: string) => {
    await Store.assignToGroup(userId, groupId);
    refresh();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = 
      filterGroup === 'all' || 
      (filterGroup === 'unallocated' && !user.groupId) || 
      user.groupId === filterGroup;

    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-violet-600 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Gestão de Usuários</h1>
            <p className="text-slate-500 font-medium">Controle de acesso, turmas e cargos da plataforma.</p>
          </div>
        </div>
      </div>

      {/* Toolbar de Filtros */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-slate-50 border-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-violet-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilterGroup('all')}
            className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterGroup === 'all' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterGroup('unallocated')}
            className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterGroup === 'unallocated' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            Não Alocados
          </button>
          {groups.map(group => (
            <button 
              key={group.id}
              onClick={() => setFilterGroup(group.id)}
              className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterGroup === group.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} className="w-14 h-14 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${user.role === Role.ADMIN ? 'bg-slate-900' : user.role === Role.MONITOR ? 'bg-violet-600' : 'bg-emerald-500'}`}>
                         {user.role === Role.ADMIN ? <ShieldCheck className="w-3 h-3 text-white" /> : <GraduationCap className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-300">
                    <span>Cargo Atual</span>
                    <span className="text-slate-900">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-300">
                    <span>Turma</span>
                    <span className={user.groupId ? 'text-violet-600' : 'text-rose-400'}>
                      {groups.find(g => g.id === user.groupId)?.name || 'NÃO ALOCADO'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                {user.role !== Role.ADMIN && (
                  <>
                    <div className="flex gap-2">
                       {user.role === Role.STUDENT ? (
                         <button onClick={() => handlePromote(user.id)} className="flex-1 bg-violet-50 text-violet-600 py-2 rounded-xl text-[10px] font-black hover:bg-violet-600 hover:text-white transition-all">PROMOVER A MONITOR</button>
                       ) : (
                         <button onClick={() => handleDemote(user.id)} className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-[10px] font-black hover:bg-rose-600 hover:text-white transition-all">REBAIXAR A ALUNO</button>
                       )}
                    </div>
                    <select 
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 focus:ring-2 focus:ring-violet-500"
                      value={user.groupId || ''}
                      onChange={(e) => handleAssignGroup(user.id, e.target.value)}
                    >
                      <option value="">ALOCAR EM TURMA...</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>)}
                      <option value="">NENHUMA (REMOVER)</option>
                    </select>
                  </>
                )}
                {user.role === Role.ADMIN && (
                  <div className="text-center p-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso de Administrador Protegido</div>
                )}
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="flex flex-col items-center gap-4">
                  <UserMinus className="w-12 h-12 text-slate-200" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum usuário encontrado com estes filtros.</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
