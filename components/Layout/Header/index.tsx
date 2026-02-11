import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Store } from '../../../services/store';
import { BrandLogo } from '../../BrandLogo';

export const Header: React.FC = () => {
  const user = Store.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Store.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <Link to="/" className="flex items-center gap-3 group whitespace-nowrap shrink-0">
            <BrandLogo size="md" />
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              Me<span className="text-violet-600">Conta</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3 md:space-x-6 shrink-0">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-slate-500 hover:text-violet-600 transition-all font-bold group"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  className="w-9 h-9 rounded-full object-cover border-2 border-violet-100 group-hover:border-violet-600 transition-all"
                  alt="Perfil"
                />
              ) : (
                <div className="p-2 bg-slate-50 rounded-xl">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <span className="hidden md:block text-sm">Perfil</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

