
import React, { useState, useEffect } from 'react';
import { Store } from '../../services/store';
import { Role, User, Group } from '../../types';
import { 
  Users, 
  ArrowLeft, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  GraduationCap, 
  UserMinus,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './style.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    <div className="users-page">
      <div className="users-header">
        <div className="users-header__left">
          <Link to="/admin" className="users-back-btn">
            <ArrowLeft size={20} />
          </Link>
          <div className="users-header__text">
            <h1 className="users-header__title">Gestão de Usuários</h1>
            <p className="users-header__subtitle">Controle de acesso, turmas e cargos da plataforma.</p>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search-wrapper">
          <Search className="users-search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="users-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="users-filters">
          <button 
            onClick={() => setFilterGroup('all')}
            className={`users-filter-btn ${filterGroup === 'all' ? 'users-filter-btn--active-all' : ''}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterGroup('unallocated')}
            className={`users-filter-btn ${filterGroup === 'unallocated' ? 'users-filter-btn--active-unallocated' : ''}`}
          >
            Não Alocados
          </button>
          {groups.map(group => (
            <button 
              key={group.id}
              onClick={() => setFilterGroup(group.id)}
              className={`users-filter-btn ${filterGroup === group.id ? 'users-filter-btn--active-group' : ''}`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="users-loading">
          <Loader2 className="users-loading-spinner" />
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-card__main">
                <div className="user-card__info">
                  <div className="user-avatar-wrapper">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} className="user-avatar-img" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <UserIcon size={24} />
                      </div>
                    )}
                    <div className={`user-role-badge ${user.role === Role.ADMIN ? 'user-role-badge--admin' : user.role === Role.MONITOR ? 'user-role-badge--monitor' : 'user-role-badge--student'}`}>
                       {user.role === Role.ADMIN ? <ShieldCheck size={12} /> : <GraduationCap size={12} />}
                    </div>
                  </div>
                  <div className="user-card__meta">
                    <div className="user-card__name">{user.name}</div>
                    <div className="user-card__email">{user.email}</div>
                  </div>
                </div>

                <div className="user-card__details">
                  <div className="user-detail-row">
                    <span>Cargo Atual</span>
                    <span className="user-detail-row__value">{user.role}</span>
                  </div>
                  <div className="user-detail-row">
                    <span>Turma</span>
                    <span className={`user-detail-row__value ${user.groupId ? 'user-detail-row__value--assigned' : 'user-detail-row__value--unassigned'}`}>
                      {groups.find(g => g.id === user.groupId)?.name || 'NÃO ALOCADO'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-card__actions">
                {user.role !== Role.ADMIN && (
                  <>
                    <div className="user-role-actions">
                       {user.role === Role.STUDENT ? (
                         <button onClick={() => handlePromote(user.id)} className="user-action-btn user-action-btn--promote">PROMOVER A MONITOR</button>
                       ) : (
                         <button onClick={() => handleDemote(user.id)} className="user-action-btn user-action-btn--demote">REBAIXAR A ALUNO</button>
                       )}
                    </div>
                    <select 
                      className="user-group-select"
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
                  <div className="user-admin-shield">Acesso de Administrador Protegido</div>
                )}
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="users-empty">
               <div className="users-empty__content">
                  <UserMinus size={48} className="users-empty__icon" />
                  <p className="users-empty__text">Nenhum usuário encontrado com estes filtros.</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
